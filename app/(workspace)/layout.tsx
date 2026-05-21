"use client";

import * as React from "react";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { WorkspaceSidebar } from "./_components/workspace-sidebar";
import { WorkspaceDataProvider } from "./_context/workspace-data-context";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceDataProvider>
      <SidebarProvider className="h-dvh min-h-0">
        <WorkspaceSidebar />
        <SidebarInset className="overflow-hidden">
          <SidebarTrigger className="absolute top-3 left-3 z-10" />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </WorkspaceDataProvider>
  );
}
