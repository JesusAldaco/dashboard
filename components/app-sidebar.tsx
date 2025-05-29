"use client"

import * as React from "react"
import {
  BookOpen,
  BookOpenCheck,
  Building2,
  Clock8,
  Command,
  LifeBuoy,
  Send,
  User,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
// import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "./ui/button"
import { SignedIn } from "@clerk/nextjs"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Estudiantes",
        url: "/estudiantes",
        icon: User,
        isActive: true,
        items:[
          {
            title: "Ver",
            url: "/estudiantes"
          },
          {
            title: "Crear",
            url: "/estudiantes/create"
          }
        ]
      },
      {
        title: "Maestros",
        url: "/maestros",
        icon: User,
        items:[
          {
            title: "Ver",
            url: "/maestros"
          },
          {
            title: "Crear",
            url: "/maestros/create"
          }
        ]
      },
      {
        title: "Materias",
        url: "/materias",
        icon: BookOpen,
        items:[
          {
            title: "Ver",
            url: "/materias"
          },
          {
            title: "Crear",
            url: "/materias/create"
          }
        ]
      },
      {
        title: "Salones",
        url: "/salones",
        icon: Building2,
        items:[
          {
            title: "Ver",
            url: "/salones"
          },
          {
            title: "Crear",
            url: "/salones/create"
          }
        ]
      },
      {
        title: "Horarios",
        url: "/horarios",
        icon: Clock8,
        items:[
          {
            title: "Ver",
            url: "/horarios"
          },
          {
            title: "Crear",
            url: "/horarios/create"
          }
        ]
      },
      {
        title: "Calificaciones",
        url: "/calificaciones",
        icon: BookOpenCheck,
        items:[
          {
            title: "Ver",
            url: "/calificaciones"
          },
          {
            title: "Crear",
            url: "/calificaciones/create"
          }
        ]
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
  }

  return (
    <SignedIn>
      <Sidebar
        className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
        {...props}
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <Button className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </Button>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Mi escuela</span>
                    <span className="truncate text-xs">Enterprice</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          {/* <NavProjects projects={data.projects} /> */}
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        </SidebarContent>
        {/* <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter> */}
      </Sidebar>
    </SignedIn>
  )
}
