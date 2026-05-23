import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../component/ui/Input";
import Button from "../../../component/ui/Button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

// VALIDASI SCHEMA (SESUAIKAN DENGAN SKEMA PRISMA)
const schema = z.object({
  name: z.string().min(3, "Nama event harus di isi"),
  tanggal: z.string().min(1, "Tanggal harus di isi"),
  description: z.string().min(5, "Deskripsi harus di isi"),
  categoryId: z.string().min(1, "Kategori harus dipilih"),
  pembicaraId: z.string().min(1, "Pembicara harus dipilih"),
});

type FormData = z.infer<typeof schema>;

interface Item {
  id: number;
  name: string;
}

export default function EventCreate() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Item[]>([]);
  const [speakers, setSpeakers] = useState<Item[]>([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [catRes, speakRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/pembicara`)
        ]);

        if (catRes.ok) setCategories(await catRes.json());
        if (speakRes.ok) setSpeakers(await speakRes.json());
      } catch (error) {
        console.error("Gagal memuat data dropdown:", error);
      }
    };
    loadDropdownData();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // KONVERSI DATA KE FORMAT YANG DITERIMA CONTROLLER
      const payload = {
        name: data.name,
        tanggal: data.tanggal, // Controller akan memproses jadi new Date()
        description: data.description,
        categoryId: Number(data.categoryId),
        pembicaraId: Number(data.pembicaraId),
      };

      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Event berhasil ditambahkan");
        navigate("/dashboard/event");
      } else {
        const errData = await response.json();
        alert(errData.message || "Gagal menambah event");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan event");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#7B1D3F]">Tambah Event</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input label="Nama Event" name="name" register={register} error={errors.name?.message} />

            {/* CATEGORY */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Category</label>
              <select {...register("categoryId")} className="border rounded-lg px-3 py-2 bg-white">
                <option value="">Pilih Category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message}</p>}
            </div>

            {/* PEMBICARA */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Pembicara</label>
              <select {...register("pembicaraId")} className="border rounded-lg px-3 py-2 bg-white">
                <option value="">Pilih Pembicara</option>
                {speakers?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {errors.pembicaraId && <p className="text-red-500 text-sm">{errors.pembicaraId.message}</p>}
            </div>

            {/* TANGGAL */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Tanggal Event</label>
              <input type="date" {...register("tanggal")} className="border rounded-lg px-3 py-2" />
              {errors.tanggal && <p className="text-red-500 text-sm">{errors.tanggal.message}</p>}
            </div>

            {/* DESKRIPSI */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Description</label>
              <textarea {...register("description")} rows={4} className="border rounded-lg px-3 py-2" />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            <Button title={isSubmitting ? "Menyimpan..." : "Simpan"} type="submit" variant="primary" />
          </form>
        </div>
      </div>
    </div>
  );
}