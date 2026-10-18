/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { TopBar } from '../components/navigation/TopBar';
import { OasisLogo } from '../components/common/OasisLogo';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  LogOut,
  RefreshCw,
  Edit3,
  Building2,
  MapPin,
  Briefcase,
  Layers,
  CheckCircle2,
  X,
  Camera,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, updateUserProfile, logout, resetData, goBack, showToast } = useFleet();

  // Profile Edit Modal State
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editRole, setEditRole] = useState(user.role);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editCompany, setEditCompany] = useState(user.company);
  const [editLocation, setEditLocation] = useState(user.location);
  const [editInitials, setEditInitials] = useState(user.initials || 'SI');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatarUrl || '');

  // Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification preferences
  const [notifySOAT, setNotifySOAT] = useState(true);
  const [notifyBreakdowns, setNotifyBreakdowns] = useState(true);
  const [notifyFuelSpikes, setNotifyFuelSpikes] = useState(true);

  const openEditModal = () => {
    setEditName(user.name);
    setEditRole(user.role);
    setEditPhone(user.phone);
    setEditEmail(user.email);
    setEditCompany(user.company);
    setEditLocation(user.location);
    setEditInitials(user.initials || user.name.slice(0, 2).toUpperCase());
    setEditAvatarUrl(user.avatarUrl || '');
    setEditProfileModalOpen(true);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('El nombre del administrador es obligatorio', 'warning');
      return;
    }

    const calculatedInitials = editInitials.trim()
      ? editInitials.trim().slice(0, 3).toUpperCase()
      : editName
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

    updateUserProfile({
      name: editName.trim(),
      role: editRole.trim() || 'Administrador de Flota',
      phone: editPhone.trim(),
      email: editEmail.trim(),
      company: editCompany.trim() || 'Ferretería El Oasis S.A.S.',
      location: editLocation.trim() || 'La Venta, Cajibío, Cauca, Colombia',
      initials: calculatedInitials,
      avatarUrl: editAvatarUrl.trim() || undefined,
    });

    setEditProfileModalOpen(false);
    showToast('Perfil de administrador actualizado correctamente', 'success');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('La nueva contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    setPasswordModalOpen(false);
    showToast('Contraseña actualizada correctamente', 'success');
  };

  return (
    <div className="pb-24 bg-[#F8F9FA] min-h-screen">
      <TopBar title="Mi Perfil" subtitle="Configuración y datos institucionales" showBack onBack={goBack} />

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <button
              onClick={openEditModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8F2] hover:bg-[#FFE3CC] text-[#F47B20] text-xs font-bold rounded-xl border border-[#FFE3CC] active:scale-95 transition-all"
              title="Editar datos del administrador"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Perfil</span>
            </button>
          </div>

          <div className="relative mb-3 mt-1">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-3xl object-cover ring-4 ring-[#FFE3CC] shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-[#5A3825] text-white font-extrabold text-2xl flex items-center justify-center ring-4 ring-[#FFE3CC] shadow-md shadow-[#5A3825]/20">
                {user.initials || user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="text-base font-extrabold text-[#2B2B2B]">{user.name}</h2>
          <span className="text-xs font-bold text-[#F47B20] mt-0.5">
            {user.role}
          </span>
          <span className="text-xs text-stone-600 mt-1 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#5A3825] shrink-0 inline" />
            {user.company} · {user.location}
          </span>
        </div>

        {/* ADMINISTRATOR CONTACT DETAILS */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider">
              Datos del Administrador de Flota
            </h3>
            <span className="text-[10px] text-stone-400 font-medium">Modificable en cualquier momento</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-2">
                <User className="w-4 h-4 text-[#F47B20]" />
                Nombre completo:
              </span>
              <span className="font-bold text-stone-800">{user.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#F47B20]" />
                Cargo administrativo:
              </span>
              <span className="font-bold text-stone-800">{user.role}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F47B20]" />
                Correo corporativo:
              </span>
              <span className="font-bold text-stone-800">{user.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F47B20]" />
                Teléfono de contacto:
              </span>
              <span className="font-bold text-stone-800">{user.phone}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#F47B20]" />
                Nivel de acceso:
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Acceso Total Administrador
              </span>
            </div>
          </div>
        </div>

        {/* COMPANY & LOCATION INFORMATION */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#F47B20]" />
              Información Institucional de la Empresa
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-1 border-b border-stone-50">
              <span className="text-stone-500 font-medium">Razón Social:</span>
              <span className="font-bold text-stone-900">{user.company}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-1 border-b border-stone-50">
              <span className="text-stone-500 font-medium">Ubicación y Sede:</span>
              <span className="font-bold text-[#5A3825]">{user.location}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-1 border-b border-stone-50">
              <span className="text-stone-500 font-medium">Actividad Comercial:</span>
              <span className="font-bold text-stone-800">
                Ferretería y transporte de materiales de construcción
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-1">
              <span className="text-stone-500 font-medium">Finalidad del Sistema:</span>
              <span className="font-semibold text-stone-700">
                Gestión de flota, vehículos, conductores y despachos
              </span>
            </div>
          </div>
        </div>

        {/* SECURITY & PREFERENCES */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            Seguridad y Alertas
          </h3>

          <button
            onClick={() => setPasswordModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center justify-between transition-colors min-h-[44px]"
          >
            <span className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#5A3825]" />
              Cambiar contraseña de acceso
            </span>
            <span className="text-stone-400 text-[10px]">Actualizar</span>
          </button>

          <div className="pt-2 space-y-2.5">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
              Preferencias de notificación
            </span>

            <label className="flex items-center justify-between cursor-pointer text-xs">
              <span className="text-stone-700 font-medium">Alertas de vencimiento SOAT y RTM</span>
              <input
                type="checkbox"
                checked={notifySOAT}
                onChange={(e) => setNotifySOAT(e.target.checked)}
                className="w-4 h-4 accent-[#F47B20] rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-xs">
              <span className="text-stone-700 font-medium">Avisos de averías críticas inmediatas</span>
              <input
                type="checkbox"
                checked={notifyBreakdowns}
                onChange={(e) => setNotifyBreakdowns(e.target.checked)}
                className="w-4 h-4 accent-[#F47B20] rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-xs">
              <span className="text-stone-700 font-medium">Anomalías en consumo de combustible</span>
              <input
                type="checkbox"
                checked={notifyFuelSpikes}
                onChange={(e) => setNotifyFuelSpikes(e.target.checked)}
                className="w-4 h-4 accent-[#F47B20] rounded"
              />
            </label>
          </div>
        </div>

        {/* SYSTEM ACTIONS */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#5A3825] uppercase tracking-wider pb-1 border-b border-stone-100">
            Administración del Sistema
          </h3>

          <button
            onClick={resetData}
            className="w-full py-2.5 px-3 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Restaurar datos predeterminados de la demo</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-3 px-4 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* BRAND EMBLEM FOOTER */}
        <div className="flex flex-col items-center pt-2 pb-6 opacity-85">
          <OasisLogo size="sm" showSubtitle={false} showSlogan={false} />
          <span className="text-[10px] text-stone-500 mt-1 font-semibold">
            Ferretería El Oasis S.A.S. · La Venta, Cajibío, Cauca
          </span>
          <span className="text-[9px] text-stone-400 mt-0.5">
            Oasis Flota v2.4 · Sistema Operativo de Transporte
          </span>
        </div>
      </div>

      {/* EDIT ADMINISTRATOR PROFILE MODAL */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-[#5A3825]">
                  Editar Perfil de Administrador
                </h3>
                <p className="text-xs text-stone-500">
                  Actualiza los datos del administrador responsable de flota
                </p>
              </div>
              <button
                onClick={() => setEditProfileModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ej: Santiago Ipía"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Cargo o Rol *
                  </label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    placeholder="Ej: Administrador de Flota"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Iniciales
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={editInitials}
                    onChange={(e) => setEditInitials(e.target.value.toUpperCase())}
                    placeholder="Ej: SI"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold uppercase focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Correo Electrónico Corporativo *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="ejemplo@eloasis.com.co"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Teléfono de Contacto *
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Ej: 310 882 9940"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Empresa Asociada *
                </label>
                <input
                  type="text"
                  required
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  placeholder="Ferretería El Oasis S.A.S."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Ubicación y Sede *
                </label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="La Venta, Cajibío, Cauca, Colombia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  URL Foto de Perfil (Opcional)
                </label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://ejemplo.com/avatar.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#F47B20] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-[#F47B20] text-white font-extrabold text-xs hover:bg-[#E06810] shadow-md shadow-[#F47B20]/20"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#5A3825] mb-1">
              Cambiar Contraseña
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Ingresa tu clave actual y define una nueva contraseña segura.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nueva contraseña (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-[#F47B20] text-white font-bold text-xs"
                >
                  Actualizar Clave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
