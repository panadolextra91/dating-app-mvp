"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Gender } from "@/lib/types";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Tên phải ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  age: z.number().min(18, "Phải trên 18 tuổi").max(120, "Già quá rồi bồ!"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  bio: z.string().max(200, "Bio ngắn thôi bồ ơi (max 200)").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const { currentUser, login } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");

  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      router.push("/swipe");
    }
  }, [currentUser, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      age: 20,
      gender: "OTHER",
      bio: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const user = await api.createUser({
        ...values,
        gender: values.gender as Gender,
        bio: values.bio || undefined,
      });
      if (user) {
        login(user);
        router.push("/swipe");
      }
    } catch {
      // Error handled by api.ts toasts
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (!loginEmail) return;
    setLoading(true);
    try {
      const user = await api.getUserByEmail(loginEmail);
      if (user) {
        login(user);
        toast.success(`Chào mừng quay trở lại, ${user.name}! 🤠`);
        router.push("/swipe");
      }
    } catch {
      // Handled by api toasts
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || currentUser) return null;

  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <Card className="neo-border neo-shadow bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-black italic tracking-tight uppercase">
            CÀ CHỚN DATING
          </CardTitle>
          <CardDescription className="text-lg font-bold text-foreground">
            Bớt nghiêm túc lại, đi tìm &quot;mối nhậu&quot; thôi bồ! 🍺
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase">Tên gì?</FormLabel>
                    <FormControl>
                      <Input placeholder="Văn Tèo..." {...field} className="neo-border h-12 text-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase">Email liên lạc</FormLabel>
                    <FormControl>
                      <Input placeholder="teo@example.com" {...field} className="neo-border h-12 text-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase">Bao nhiêu tuổi?</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="neo-border h-12 text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase">Giới tính</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="neo-border h-12 text-lg">
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="neo-border">
                          <SelectItem value="MALE">Nam</SelectItem>
                          <SelectItem value="FEMALE">Nữ</SelectItem>
                          <SelectItem value="OTHER">Linh hoạt</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase">Sở trường / Phốt bản thân</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Thích đi nhậu, hay ngủ gật trên bàn..."
                        {...field}
                        className="neo-border min-h-[100px] text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full text-xl h-16" disabled={loading}>
                {loading ? "ĐANG TẠO HỒ SƠ..." : "BẮT ĐẦU CÀ CHỚN! 🚀"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Login Section */}
      <Card className="neo-border neo-shadow bg-card mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-black uppercase italic">
            MẸ ĐÃ CÓ TÀI KHOẢN?
          </CardTitle>
          <CardDescription className="text-md font-bold text-foreground">
            Nhập email để cà chớn tiếp bồ ơi!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="teo@example.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="neo-border h-14 text-lg bg-white"
            />
            <Button
              onClick={handleLogin}
              disabled={loading || !loginEmail}
              className="h-14 px-8 text-xl"
            >
              {loading ? "ĐANG VÔ..." : "VÔ LUÔN! 🚀"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
