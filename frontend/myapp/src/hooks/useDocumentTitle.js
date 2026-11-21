import { useEffect } from "react";

export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — ZIPREE` : "ZIPREE — Drive Beyond Ordinary";
    return () => {
      document.title = previous;
    };
  }, [title]);
}