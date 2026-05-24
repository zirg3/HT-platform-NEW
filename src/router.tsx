import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from "@tanstack/react-router"
import { RoleLayout } from "@/components/layout/role-layout"
import { NotFoundPage } from "@/pages/not-found-page"
import { getRoleHomePath } from "@/lib/auth/paths"
import { AdminPage } from "@/pages/admin-page"
import { AdminAssignmentsPage } from "@/pages/admin-assignments-page"
import { AdminCoursesPage } from "@/pages/admin-courses-page"
import { AdminUsersPage } from "@/pages/admin-users-page"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { HomePage } from "@/pages/home-page"
import { LoginPage } from "@/pages/login-page"
import { ManagerPage } from "@/pages/manager-page"
import { ManagerAssignmentsPage } from "@/pages/manager-assignments-page"
import { ResetPasswordPage } from "@/pages/reset-password-page"
import { StudentPage } from "@/pages/student-page"
import { TeacherPage } from "@/pages/teacher-page"
import { TeacherStudentProfilePage } from "@/pages/teacher-student-profile-page"
import { TeacherStudentsPage } from "@/pages/teacher-students-page"
import type { AuthRouterContext } from "@/providers/auth-provider"
import type { UserRole } from "@/types/roles"

const rootRoute = createRootRouteWithContext<AuthRouterContext>()({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
})

const guardAuth = (requiredRole?: UserRole) => {
  return ({ context, location }: { context: AuthRouterContext; location: { href: string } }) => {
    const { auth } = context

    if (auth.isLoading) {
      return
    }

    if (!auth.profile) {
      throw redirect({
        to: "/login",
        search: { next: location.href },
      })
    }

    if (requiredRole && auth.profile.role !== requiredRole) {
      throw redirect({ to: getRoleHomePath(auth.profile.role) })
    }
  }
}

const guardGuest = ({ context }: { context: AuthRouterContext }) => {
  if (context.auth.isLoading) return
  if (context.auth.profile) {
    throw redirect({ to: getRoleHomePath(context.auth.profile.role) })
  }
}

const roleLayout = (role: UserRole, basePath: string) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: basePath,
    beforeLoad: guardAuth(role),
    component: RoleLayout,
  })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : undefined,
    reset: typeof search.reset === "string" ? search.reset : undefined,
  }),
  beforeLoad: guardGuest,
  component: LoginPage,
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login/forgot-password",
  beforeLoad: guardGuest,
  component: ForgotPasswordPage,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login/reset-password",
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  beforeLoad: guardGuest,
  component: ResetPasswordPage,
})

const studentLayout = roleLayout("student", "/student")
const teacherLayout = roleLayout("teacher", "/teacher")
const managerLayout = roleLayout("manager", "/manager")
const adminLayout = roleLayout("admin", "/admin")

const studentRoute = createRoute({
  getParentRoute: () => studentLayout,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    week: typeof search.week === "string" ? search.week : undefined,
  }),
  component: StudentPage,
})

const teacherRoute = createRoute({
  getParentRoute: () => teacherLayout,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    week: typeof search.week === "string" ? search.week : undefined,
  }),
  component: TeacherPage,
})

const teacherStudentsRoute = createRoute({
  getParentRoute: () => teacherLayout,
  path: "students",
  component: TeacherStudentsPage,
})

const teacherStudentProfileRoute = createRoute({
  getParentRoute: () => teacherLayout,
  path: "students/$studentId",
  component: TeacherStudentProfilePage,
})

const managerRoute = createRoute({
  getParentRoute: () => managerLayout,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    week: typeof search.week === "string" ? search.week : undefined,
  }),
  component: ManagerPage,
})

const managerAssignmentsRoute = createRoute({
  getParentRoute: () => managerLayout,
  path: "assignments",
  component: ManagerAssignmentsPage,
})

const adminRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    week: typeof search.week === "string" ? search.week : undefined,
  }),
  component: AdminPage,
})

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "users",
  validateSearch: (search: Record<string, unknown>) => ({
    role: typeof search.role === "string" ? search.role : undefined,
  }),
  component: AdminUsersPage,
})

const adminCoursesRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "courses",
  component: AdminCoursesPage,
})

const adminAssignmentsRoute = createRoute({
  getParentRoute: () => adminLayout,
  path: "assignments",
  component: AdminAssignmentsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  studentLayout.addChildren([studentRoute]),
  teacherLayout.addChildren([
    teacherRoute,
    teacherStudentsRoute,
    teacherStudentProfileRoute,
  ]),
  managerLayout.addChildren([managerRoute, managerAssignmentsRoute]),
  adminLayout.addChildren([
    adminRoute,
    adminUsersRoute,
    adminCoursesRoute,
    adminAssignmentsRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  context: undefined! as AuthRouterContext,
  defaultPreload: "intent",
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
