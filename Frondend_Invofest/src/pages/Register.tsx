import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

// SCHEMA: Diubah dari email menjadi nim (huruf kecil)
const schema = z.object({
  username: z.string().trim().min(3, "Username minimal 3 karakter"),
  nim: z.string().trim().min(5, "NIM harus diisi dengan benar"),
  password: z.string().min(4, "Password minimal 4 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username.trim(),
          nim: data.nim.trim(), // Dikirim sebagai nim ke database
          password: data.password.trim(),
        }),
      });

      if (response.ok) {
        alert("Pendaftaran berhasil! Silakan login menggunakan NIM Anda.");
        navigate("/login");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Pendaftaran gagal, NIM mungkin sudah terdaftar.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error register:", error);
      alert("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow text-center">

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#7B1D3F] mb-2">Daftar Akun</h1>
        <p className="text-gray-400 mb-6 text-sm">Lengkapi data untuk bergabung</p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="text-left space-y-4">

          {/* Username */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 text-sm">Username</label>
            <input
              type="text"
              {...register("username")}
              placeholder="Username Anda"
              className={`w-full px-3 py-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-[#7B1D3F] ${errors.username ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
          </div>

          {/* NIM (PENGGANTI EMAIL) */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 text-sm">NIM</label>
            <input
              type="text"
              {...register("nim")} // Menggunakan nim
              placeholder="Masukkan NIM Anda"
              className={`w-full px-3 py-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-[#7B1D3F] ${errors.nim ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.nim && <p className="text-xs text-red-500 mt-1">{errors.nim.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 text-sm">Password</label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className={`w-full px-3 py-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-[#7B1D3F] ${errors.password ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700 text-sm">Konfirmasi Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              placeholder="••••••••"
              className={`w-full px-3 py-3 rounded-xl border bg-gray-50 outline-none focus:ring-2 focus:ring-[#7B1D3F] ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7B1D3F] text-white py-3 rounded-xl font-semibold shadow hover:bg-[#5a152e] transition"
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-gray-500 mt-6 text-sm">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-[#7B1D3F] font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}