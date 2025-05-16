"use client"

import { SidebarIcon } from "lucide-react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useBreadcrumbStore } from "@/store/breadcrumbStore"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const items = useBreadcrumbStore(state => state.items)
  const setBredcrumb = useBreadcrumbStore(state => state.setBreadcrum)
  const pathname = usePathname()

  // Actualizar el breadcrumb cuando cambia la ruta
  useEffect(() =>{
    setBredcrumb(pathname)
  }, [pathname, setBredcrumb])

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {items.map((item, index) =>(
              <BreadcrumbItem key={index}>
                {item.isCurrentPage ?(
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ):(
                  <>
                    <BreadcrumbLink href={item.href || '#'}>
                      {item.label}
                    </BreadcrumbLink>
                    {index < items.length - 1 && <BreadcrumbSeparator />}
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="justify-end flex-1 hidden sm:flex">
          <ThemeToggle />
        </div>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  )
}
