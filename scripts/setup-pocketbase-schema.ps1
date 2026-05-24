param(
  [Parameter(Mandatory = $true)]
  [string]$Email,
  [Parameter(Mandatory = $true)]
  [string]$Password,
  [string]$BaseUrl = "http://127.0.0.1:8090"
)

$ErrorActionPreference = "Stop"

Write-Host "PocketBase schema setup -> $BaseUrl"

try {
  $authBody = @{ identity = $Email; password = $Password } | ConvertTo-Json
  $auth = Invoke-RestMethod -Method POST `
    -Uri "$BaseUrl/api/collections/_superusers/auth-with-password" `
    -ContentType "application/json" `
    -Body $authBody
} catch {
  Write-Host "Superuser auth failed. Check email/password and that PocketBase is running (npm run pb:serve)."
  throw
}

$headers = @{ Authorization = $auth.token }

function Get-CollectionByName($name) {
  $list = Invoke-RestMethod -Uri "$BaseUrl/api/collections?page=1&perPage=200" -Headers $headers
  return $list.items | Where-Object { $_.name -eq $name } | Select-Object -First 1
}

function Merge-Fields($existingFields, $newFields) {
  $names = @($existingFields | ForEach-Object { $_.name })
  $merged = @($existingFields)
  foreach ($f in $newFields) {
    if ($names -notcontains $f.name) {
      $merged += $f
    }
  }
  return $merged
}

function Patch-Collection($id, $body) {
  Invoke-RestMethod -Method PATCH `
    -Uri "$BaseUrl/api/collections/$id" `
    -Headers $headers `
    -ContentType "application/json" `
    -Body ($body | ConvertTo-Json -Depth 30) | Out-Null
}

function New-TextField($name, $required, $max) {
  return @{ name = $name; type = "text"; required = $required; min = 0; max = $max; pattern = "" }
}

function New-SelectField($name, $required, $values) {
  return @{ name = $name; type = "select"; required = $required; maxSelect = 1; values = $values }
}

function New-BoolField($name, $required) {
  return @{ name = $name; type = "bool"; required = $required }
}

function New-NumberField($name, $required, $min, $max) {
  return @{ name = $name; type = "number"; required = $required; min = $min; max = $max; noDecimal = $true }
}

function New-DateField($name, $required) {
  return @{ name = $name; type = "date"; required = $required }
}

function New-UrlField($name, $required) {
  return @{ name = $name; type = "url"; required = $required; exceptDomains = @(); onlyDomains = @() }
}

function New-JsonField($name, $required, $maxSize) {
  return @{ name = $name; type = "json"; required = $required; maxSize = $maxSize }
}

function New-RelationField($name, $required, $collectionId, $cascadeDelete) {
  return @{
    name          = $name
    type          = "relation"
    required      = $required
    collectionId  = $collectionId
    cascadeDelete = $cascadeDelete
    minSelect     = 0
    maxSelect     = 1
  }
}

function Get-MissingFields($existingFields, $desiredFields) {
  $names = @($existingFields | ForEach-Object { $_.name })
  return @($desiredFields | Where-Object { $names -notcontains $_.name })
}

function Sync-Fields($collectionId, $collectionName, $existingFields, $desiredFields) {
  $missing = Get-MissingFields $existingFields $desiredFields
  if ($missing.Count -eq 0) {
    Write-Host "  fields: $collectionName (up to date)"
    return $existingFields
  }
  $merged = Merge-Fields $existingFields $desiredFields
  $names = ($missing | ForEach-Object { $_.name }) -join ", "
  Write-Host "  fields: $collectionName (+$($missing.Count): $names)"
  Patch-Collection $collectionId @{ fields = $merged }
  return $merged
}

function Ensure-Collection($name, $customFields, $rules) {
  $existing = Get-CollectionByName $name
  if (-not $existing) {
    Write-Host "  create: $name"
    $existing = Invoke-RestMethod -Method POST `
      -Uri "$BaseUrl/api/collections" `
      -Headers $headers `
      -ContentType "application/json" `
      -Body (@{
        name       = $name
        type       = "base"
        listRule   = $null
        viewRule   = $null
        createRule = $null
        updateRule = $null
        deleteRule = $null
        fields     = $customFields
      } | ConvertTo-Json -Depth 30)
  } else {
    Sync-Fields $existing.id $name $existing.fields $customFields | Out-Null
  }

  if ($rules) {
    Write-Host "  rules: $name"
    Patch-Collection $existing.id $rules
  }

  return (Get-CollectionByName $name)
}

function Set-FieldRequired($fields, $fieldName, $required) {
  return @($fields | ForEach-Object {
    if ($_.name -eq $fieldName) {
      $copy = @{}
      $_.PSObject.Properties | ForEach-Object { $copy[$_.Name] = $_.Value }
      $copy["required"] = $required
      return $copy
    }
    return $_
  })
}

function Patch-UsersAuthFields {
  Write-Host "users: sync fields + rules..."
  $users = Invoke-RestMethod -Uri "$BaseUrl/api/collections/_pb_users_auth_" -Headers $headers
  $custom = @(
    (New-TextField "full_name" $false 200),
    (New-SelectField "role" $true @("student", "teacher", "manager", "admin")),
    (New-BoolField "is_teacher" $false)
  )
  $fields = Merge-Fields $users.fields $custom
  $fields = Set-FieldRequired $fields "is_teacher" $false
  Patch-Collection "_pb_users_auth_" @{
    fields     = $fields
    listRule   = '@request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.role = "manager" || id = @request.auth.id)'
    viewRule   = '@request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.role = "manager" || id = @request.auth.id)'
    createRule = '@request.auth.role = "admin"'
    updateRule = '@request.auth.role = "admin" || id = @request.auth.id'
    deleteRule = '@request.auth.role = "admin"'
  }
  Write-Host "  rules: users"
  Write-Host "  users: OK"
}

Patch-UsersAuthFields

$usersId = "_pb_users_auth_"

$coursesFields = @(
  (New-TextField "title" $true 200),
  (New-TextField "color" $true 20)
)
$coursesRules = @{
  listRule   = '@request.auth.id != ""'
  viewRule   = '@request.auth.id != ""'
  createRule = '@request.auth.role = "admin"'
  updateRule = '@request.auth.role = "admin"'
  deleteRule = '@request.auth.role = "admin"'
}
$courses = Ensure-Collection "courses" $coursesFields $coursesRules

$lessonsFields = @(
  (New-DateField "starts_at" $true),
  (New-NumberField "duration_minutes" $true 15 240),
  (New-RelationField "course" $false $courses.id $false),
  (New-RelationField "teacher" $true $usersId $false),
  (New-SelectField "status" $true @("scheduled", "cancelled", "completed")),
  (New-TextField "note" $false 2000),
  (New-UrlField "meeting_url" $false),
  (New-TextField "recurrence_group_id" $false 100),
  (New-DateField "cancelled_at" $false),
  (New-RelationField "cancelled_by" $false $usersId $false),
  (New-TextField "cancellation_reason" $false 1000),
  (New-DateField "rescheduled_at" $false),
  (New-RelationField "rescheduled_by" $false $usersId $false),
  (New-DateField "original_starts_at" $false)
)
$lessons = Ensure-Collection "lessons" $lessonsFields $null

$participantsFields = @(
  (New-RelationField "lesson" $true $lessons.id $true),
  (New-RelationField "profile" $true $usersId $true)
)
$participantsRules = @{
  listRule   = '@request.auth.id != "" && (profile = @request.auth.id || @request.auth.role ?= "admin|manager" || @collection.lessons.teacher ?= @request.auth.id)'
  viewRule   = '@request.auth.id != "" && (profile = @request.auth.id || @request.auth.role ?= "admin|manager" || @collection.lessons.teacher ?= @request.auth.id)'
  createRule = '@request.auth.role ?= "admin|manager" || @collection.lessons.teacher ?= @request.auth.id'
  updateRule = '@request.auth.role ?= "admin|manager" || @collection.lessons.teacher ?= @request.auth.id'
  deleteRule = '@request.auth.role ?= "admin|manager" || @collection.lessons.teacher ?= @request.auth.id'
}
Ensure-Collection "lesson_participants" $participantsFields $participantsRules | Out-Null

$lessonsRules = @{
  listRule   = '@request.auth.id != "" && (@request.auth.role ?= "admin|manager" || teacher = @request.auth.id || @collection.lesson_participants.profile ?= @request.auth.id)'
  viewRule   = '@request.auth.id != "" && (@request.auth.role ?= "admin|manager" || teacher = @request.auth.id || @collection.lesson_participants.profile ?= @request.auth.id)'
  createRule = '@request.auth.id != "" && (@request.auth.role ?= "admin|manager|teacher")'
  updateRule = '@request.auth.role ?= "admin|manager" || teacher = @request.auth.id'
  deleteRule = '@request.auth.role ?= "admin|manager" || teacher = @request.auth.id'
}
Write-Host "  rules: lessons"
Patch-Collection $lessons.id $lessonsRules

$studentTeacherFields = @(
  (New-RelationField "student" $true $usersId $true),
  (New-RelationField "teacher" $true $usersId $true)
)
$studentTeacherRules = @{
  listRule   = '@request.auth.id != "" && (student = @request.auth.id || teacher = @request.auth.id || @request.auth.role ?= "admin|manager")'
  viewRule   = '@request.auth.id != "" && (student = @request.auth.id || teacher = @request.auth.id || @request.auth.role ?= "admin|manager")'
  createRule = '@request.auth.role ?= "admin|manager"'
  updateRule = '@request.auth.role ?= "admin|manager"'
  deleteRule = '@request.auth.role ?= "admin|manager"'
}
Ensure-Collection "student_teacher" $studentTeacherFields $studentTeacherRules | Out-Null

$homeworkFields = @(
  (New-RelationField "lesson" $true $lessons.id $true),
  (New-TextField "body" $false 10000)
)
$homeworkRules = @{
  listRule   = '@request.auth.id != ""'
  viewRule   = '@request.auth.id != ""'
  createRule = '@request.auth.id != ""'
  updateRule = '@request.auth.id != ""'
  deleteRule = '@request.auth.id != ""'
}
Ensure-Collection "homework" $homeworkFields $homeworkRules | Out-Null

$auditFields = @(
  (New-RelationField "lesson" $true $lessons.id $true),
  (New-SelectField "action" $true @("created", "updated", "cancelled")),
  (New-RelationField "actor" $false $usersId $false),
  (New-JsonField "meta" $false 2000000)
)
$auditRules = @{
  listRule   = '@request.auth.id != ""'
  viewRule   = '@request.auth.id != ""'
  createRule = '@request.auth.id != ""'
  updateRule = $null
  deleteRule = $null
}
Ensure-Collection "lesson_audit" $auditFields $auditRules | Out-Null

Write-Host ""
Write-Host "Done! Next steps:"
Write-Host "  1. Collections -> users -> New record (admin@test.ru, role=admin)"
Write-Host "  2. npm run dev -> http://localhost:5173"
Write-Host ""
Write-Host "See pocketbase/SETUP.md for details"
