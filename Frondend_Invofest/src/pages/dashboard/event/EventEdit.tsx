import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../component/ui/Input";
import Button from "../../../component/ui/Button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

const schema = z.object({
  name: z.string().min(3, "Nama event harus di isi"),
  tanggal: z.string().min(1, "Tanggal harus di isi"),
  location: z.string().min(3, "Lokasi harus di isi"),
  description: z.string().min(5, "Deskripsi harus di isi"),
  categoryId: z.string().min(1, "Kategori harus dipilih"),
});

type FormData = z.infer<typeof schema>;

interface Item {
  id: number;
  name: string;
}

export default function EventEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<Item[]>([]);
  const [speakers, setSpeakers] = useState<Item[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, speakRes, eventRes] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/pembicara`),
          fetch(`${API_URL}/events/${id}`)
        ]);

        if (catRes.ok) setCategories(await catRes.json());
        if (speakRes.ok) setSpeakers(await speakRes.json());

        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setValue("name", eventData.name);
          setValue("location", eventData.location);
          setValue("description", eventData.description);
          setValue("categoryId", String(eventData.categoryId));
          
          if (eventData.dateEvent) {
            const d = new Date(eventData.dateEvent);
            const formatted = d.toISOString().split('T')[0];
            setValue("tanggal", formatted);
          }
        } else {
          alert("Gagal memuat data event");
          navigate("/dashboard/event");
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    if (id) loadData();
  }, [id, API_URL, setValue, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name,
        dateEvent: data.tanggal, 
        location: data.location,
        description: data.description,
        categoryId: Number(data.categoryId),
      };

      const response = await fetch(`${API_URL}/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Event berhasil diupdate");
        navigate("/dashboard/event");
      } else {
        const errData = await response.json();
        alert(errData.message || "Gagal mengupdate event");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengupdate event");
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 animate-pulse text-sm">Sedang memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#7B1D3F]">Edit Event</h1>
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

            {/* TANGGAL */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Tanggal Event</label>
              <input type="date" {...register("tanggal")} className="border rounded-lg px-3 py-2" />
              {errors.tanggal && <p className="text-red-500 text-sm">{errors.tanggal.message}</p>}
            </div>

            {/* LOKASI */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Lokasi</label>
              <input type="text" {...register("location")} placeholder="Masukkan lokasi" className="border rounded-lg px-3 py-2" />
              {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
            </div>

            {/* DESKRIPSI */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Description</label>
              <textarea {...register("description")} rows={4} className="border rounded-lg px-3 py-2" />
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            <Button title={isSubmitting ? "Menyimpan..." : "Simpan Perubahan"} type="submit" variant="primary" />
          </form>
        </div>
      </div>
    </div>
  );
}
