"use client";

import { Link as LinkType } from "@/types";
import { getResourceDownloadUrl } from "@/lib/actions";

interface ResourceLinkProps {
  link: LinkType;
  children?: React.ReactNode;
  className?: string;
}

export default function ResourceLink({ link, children, className }: ResourceLinkProps) {
  const isFileResource = (link: LinkType) => {
    return link.type === 'file' || 
           link.url.includes('idrivee2.com') || 
           link.url.includes('epixum-javascript-storage');
  };

  const handleResourceClick = async (e: React.MouseEvent) => {
    if (isFileResource(link)) {
        e.preventDefault();
        try {
            const result = await getResourceDownloadUrl(link.id);
            if (result.success && result.url) {
                window.open(result.url, '_blank');
            } else {
                alert("No se pudo descargar el archivo.");
            }
        } catch (error) {
            console.error(error);
            alert("Error al descargar el archivo.");
        }
    }
  };

  return (
    <a 
      href={isFileResource(link) ? '#' : link.url} 
      target={isFileResource(link) ? undefined : "_blank"}
      rel={isFileResource(link) ? undefined : "noopener noreferrer"}
      onClick={handleResourceClick}
      className={className}
    >
      {children}
    </a>
  );
}