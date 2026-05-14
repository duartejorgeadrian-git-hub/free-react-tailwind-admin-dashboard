import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/use-toast";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "", // Opcional ahora
    role: "operador" // Valor por defecto para creación interna
  });
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, role: currentUserRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(formData.username, formData.password, {
      nombre: formData.nombre,
      apellido: formData.apellido,
      dni: formData.dni,
      telefono: formData.telefono,
      email: formData.email,
      role: formData.role
    });

    if (error) {
      toast({
        title: "Error al crear usuario",
        description: error.message || "No se pudo completar el registro",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Usuario creado",
        description: `El usuario ${formData.username} ha sido registrado correctamente.`,
      });
      // Si es un admin creando a otro, se queda aquí. Si es un registro nuevo (app), va al login.
      if (currentUserRole === 'superadmin' || currentUserRole === 'admin') {
         // Limpiar form
         setFormData({
            username: "", password: "", nombre: "", apellido: "", dni: "", telefono: "", email: "", role: "operador"
         });
      } else {
        navigate("/signin");
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Volver al panel
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Crear Nuevo Usuario
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Registra un nuevo integrante en el sistema.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Nombre<span className="text-error-500">*</span></Label>
                    <Input name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre" required />
                  </div>
                  <div>
                    <Label>Apellido<span className="text-error-500">*</span></Label>
                    <Input name="apellido" value={formData.apellido} onChange={handleInputChange} placeholder="Apellido" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>DNI<span className="text-error-500">*</span></Label>
                    <Input name="dni" value={formData.dni} onChange={handleInputChange} placeholder="Documento" required />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Nro de contacto" />
                  </div>
                </div>

                <div>
                  <Label>Nombre de Usuario (Login)<span className="text-error-500">*</span></Label>
                  <Input name="username" value={formData.username} onChange={handleInputChange} placeholder="Ej: jsmith" required />
                </div>

                <div>
                  <Label>Email (Opcional)</Label>
                  <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="correo@ejemplo.com" />
                </div>

                <div>
                  <Label>Contraseña<span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <Input
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Mínimo 6 caracteres"
                      type={showPassword ? "text" : "password"}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                {(currentUserRole === 'superadmin' || currentUserRole === 'admin') && (
                  <div>
                    <Label>Rol del Sistema</Label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-900 dark:border-gray-800"
                    >
                      <option value="operador">Operador</option>
                      <option value="admin">Administrador</option>
                      {currentUserRole === 'superadmin' && <option value="superadmin">SuperAdmin</option>}
                    </select>
                  </div>
                )}

                <div className="pt-2">
                  <Button className="w-full" size="sm" disabled={isLoading}>
                    {isLoading ? "Registrando..." : "Crear Usuario"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿Ya tienes cuenta? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Inicia Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
