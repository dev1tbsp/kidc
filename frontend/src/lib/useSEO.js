import { useEffect } from "react";

export default function useSEO({ title, description, image }) {
  useEffect(() => {
    if (title) document.title = title;
    const ensure = (selector, attr, content) => {
      if (!content) return;
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const [k, v] = selector.replace("meta[", "").replace("]", "").split("=");
        el.setAttribute(k, v.replace(/['"]/g, ""));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };
    ensure('meta[name="description"]', "content", description);
    ensure('meta[property="og:title"]', "content", title);
    ensure('meta[property="og:description"]', "content", description);
    ensure('meta[property="og:image"]', "content", image);
    ensure('meta[name="twitter:card"]', "content", "summary_large_image");
  }, [title, description, image]);
}
