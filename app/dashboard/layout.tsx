"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../california/lib/supabase";

const CURATOR_EMAIL = "virtualpostcardmuseum+curator@gmail.com";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    let revision = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function checkCurator() {
      const currentRevision = ++revision;

      try {
        const { data, error } = await supabase.auth.getUser();

        if (!active || currentRevision !== revision) return;

        const isCurator =
          !error &&
          data.user?.email?.toLowerCase() ===
            CURATOR_EMAIL.toLowerCase();

        setAuthorized(Boolean(isCurator));

        if (!isCurator) {
          router.replace("/curator-login");
        }
      } catch {
        if (!active || currentRevision !== revision) return;

        setAuthorized(false);
        router.replace("/curator-login");
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;

      if (event === "SIGNED_OUT") {
        revision++;
        setAuthorized(false);
        router.replace("/curator-login");
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (active) void checkCurator();
        }, 0);
      }
    });

    void checkCurator();

    return () => {
      active = false;
      revision++;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [router]);

  if (!authorized) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f5e6c8",
          color: "#553321",
          fontFamily: "Georgia, serif",
        }}
      >
        <p>Checking curator sign-in…</p>
      </main>
    );
  }

  return <>{children}</>;
}