import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import Input from "../../../component/ui/Input";
import Button from "../../../component/ui/Button";

import { useAuthStore } from "../../../store/useAuthStore";

// SCHEMA
const schema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  role: z.string().min(3, "Role minimal 3 karakter"),
  image: z.string().min(3, "Image wajib diisi"),
});

type FormData = z.infer<typeof schema>;

export default function PembicaraEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isFetching, setIsFetching] = useState(true);

  const token = useAuthStore((state: any) => state.token);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // FETCH DATA
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${API_URL}/pembicara/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setValue("name", data.name);
          setValue("role", data.role);
          setValue("image", data.image);
        } else {
          alert("Gagal memuat data pembicara");
          navigate("/dashboard/pembicara");
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    if (id) loadData();
  }, [id, API_URL, token, setValue, navigate]);

  // SUBMIT
  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${API_URL}/pembicara/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Gagal update pembicara");
      }

      alert("Pembicara berhasil diupdate!");
      navigate("/dashboard/pembicara");
    } catch (error) {
      console.log(error);
      alert("Gagal mengupdate pembicara");
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
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#7B1D3F]">
            Edit Pembicara
          </h1>
          <p className="text-gray-500 mt-2">
            Ubah data pembicara untuk event
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* NAMA */}
            <Input
              label="Nama Pembicara"
              name="name"
              type="text"
              placeholder="Masukkan nama pembicara"
              register={register}
              error={errors.name?.message}
            />

            {/* ROLE */}
            <Input
              label="Role Pembicara"
              name="role"
              type="text"
              placeholder="Masukkan role pembicara"
              register={register}
              error={errors.role?.message}
            />

            {/* IMAGE */}
            <Input
              label="Image URL"
              name="image"
              type="text"
              placeholder="Masukkan link image"
              register={register}
              error={errors.image?.message}
            />

            {/* BUTTON */}
            <div className="pt-2">
              <Button
                type="submit"
                title={isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                variant="primary"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
