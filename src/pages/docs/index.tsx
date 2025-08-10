import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useEffect, useState } from "react";

export default function SwaggerPage() {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    fetch("/api/swagger")
      .then((res) => res.json())
      .then(setSpec);
  }, []);

  return spec ? <SwaggerUI spec={spec} /> : <div>Chargement...</div>;
}
