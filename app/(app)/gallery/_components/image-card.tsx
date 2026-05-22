"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { Cpu, Download, Tags as TagsIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipPositioner,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  cn,
  estimateBase64Bytes,
  formatBytes,
  formatTimestamp,
  imageExtension,
} from "@/lib/utils";
import type { ChatMessage } from "@/lib/chat/types";

type ImageCardProps = {
  message: ChatMessage;
  prompt: string;
};

export function ImageCard({ message, prompt }: ImageCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  if (!message.imageData) return null;

  const imageAlt = message.revisedPrompt ?? prompt ?? "Generated image";
  const stats: string[] = [formatTimestamp(message.createdAt)];
  stats.push(formatBytes(estimateBase64Bytes(message.imageData)));

  const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!message.imageData) return;
    const link = document.createElement("a");
    link.href = message.imageData;
    link.download = `imgen-${message.id}.${imageExtension(message.imageData)}`;
    link.click();
  };

  return (
    <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <div className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-subtle transition-shadow duration-150 hover:shadow-modal">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="block w-full cursor-zoom-in focus:ring-[3px] focus:ring-primary/15 focus:outline-none"
            aria-label="Open image preview"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-surface-soft">
              <Image
                src={message.imageData}
                alt={imageAlt}
                width={512}
                height={512}
                unoptimized
                className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
              />
            </div>
          </button>

          <button
            type="button"
            aria-label="Download image"
            onClick={handleDownload}
            className={cn(
              "absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-hairline-soft bg-card/95 text-steel shadow-subtle",
              "opacity-0 transition-opacity duration-150 ease-out group-focus-within:opacity-100 group-hover:opacity-100",
              "hover:bg-secondary hover:text-ink focus:opacity-100 focus:ring-[3px] focus:ring-primary/15 focus:outline-none",
            )}
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-1.5 p-3">
          {prompt ? (
            <p className="line-clamp-2 text-[12px] leading-relaxed wrap-break-word text-charcoal">
              {prompt}1
            </p>
          ) : null}
          <div className="flex items-center gap-1.5 text-[11px] tracking-tight text-stone tabular-nums">
            <span className="leading-none">{stats.join(" · ")}</span>
            {message.tags.length > 0 ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={(event) => event.stopPropagation()}
                      aria-label={`Tags: ${message.tags.map((t) => t.name).join(", ")}`}
                      className="inline-flex h-4 w-4 items-center justify-center rounded text-stone transition-colors duration-150 hover:text-primary focus:ring-[3px] focus:ring-primary/15 focus:outline-none"
                    >
                      <TagsIcon className="h-3 w-3" />
                    </button>
                  }
                />
                <TooltipPositioner side="top">
                  <TooltipContent className="max-w-xs">
                    {message.tags.map((t) => t.name).join(" · ")}
                  </TooltipContent>
                </TooltipPositioner>
              </Tooltip>
            ) : null}
            {message.model ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={(event) => event.stopPropagation()}
                      aria-label={`Model: ${message.model}`}
                      className="inline-flex h-4 w-4 items-center justify-center rounded text-stone transition-colors duration-150 hover:text-primary focus:ring-[3px] focus:ring-primary/15 focus:outline-none"
                    >
                      <Cpu className="h-3 w-3" />
                    </button>
                  }
                />
                <TooltipPositioner side="top">
                  <TooltipContent className="max-w-xs">
                    {message.model}
                  </TooltipContent>
                </TooltipPositioner>
              </Tooltip>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[min(92vw,1100px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-modal transition-[opacity,transform] duration-200 ease-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <Dialog.Title className="sr-only">
            Generated image preview
          </Dialog.Title>
          <Image
            src={message.imageData}
            alt={imageAlt}
            width={1536}
            height={1536}
            unoptimized
            className="max-h-[86vh] w-full rounded-lg object-contain"
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
