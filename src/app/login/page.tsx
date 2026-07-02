"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "เข้าสู่ระบบไม่สำเร็จ");
      router.replace(searchParams.get("next") || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginShell error={error} loading={loading} username={username} password={password} onUsername={setUsername} onPassword={setPassword} onSubmit={submit} />
  );
}

function LoginShell({ error = "", loading = false, username = "", password = "", onUsername, onPassword, onSubmit }: { error?: string; loading?: boolean; username?: string; password?: string; onUsername?: (value: string) => void; onPassword?: (value: string) => void; onSubmit?: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-primary text-primary-foreground">
            <PiggyBank className="h-7 w-7" />
          </div>
          <CardTitle className="mt-4 text-2xl">เข้าสู่ MoneyTomtam</CardTitle>
          <p className="text-sm text-muted-foreground">สำหรับเจ้าของแอพเท่านั้น ไม่มีสมัครสมาชิก</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input id="username" value={username} onChange={(event) => onUsername?.(event.target.value)} autoComplete="username" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input id="password" type="password" value={password} onChange={(event) => onPassword?.(event.target.value)} autoComplete="current-password" />
            </div>
            {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={loading}>{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
