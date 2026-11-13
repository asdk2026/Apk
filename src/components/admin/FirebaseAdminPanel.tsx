import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  X,
  Lock,
  Unlock,
  KeyRound,
  AlertCircle,
  Save,
  Sliders,
  UserCheck,
  UserX,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  UserAccount,
  FirebaseUserRole,
  UserPermissions,
  ModulePermissions,
  ActionPermissions,
} from '../../types';
import {
  getDefaultPermissionsForRole,
  normalizePermissions,
  MODULE_PERMISSION_LIST,
  ACTION_PERMISSION_LIST,
  ROOT_ADMIN_EMAIL,
} from '../../utils/permissions';

export const FirebaseAdminPanel: React.FC = () => {
  const {
    currentUser,
    users,
    language,
    createStaffUser,
    updateStaffUser,
    deleteStaffUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | FirebaseUserRole>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create New Account Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<FirebaseUserRole>('user');
  const [newPermissions, setNewPermissions] = useState<UserPermissions>(() =>
    getDefaultPermissionsForRole('user')
  );
  const [creating, setCreating] = useState(false);

  // Edit Existing User Permissions & Role Modal
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<FirebaseUserRole>('user');
  const [editActive, setEditActive] = useState(true);
  const [editPermissions, setEditPermissions] = useState<UserPermissions>(() =>
    getDefaultPermissionsForRole('user')
  );
  const [savingEdit, setSavingEdit] = useState(false);

  const isBn = language === 'bn';

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      managers: users.filter((u) => u.role === 'manager').length,
      regularUsers: users.filter((u) => u.role === 'user').length,
      suspended: users.filter((u) => !u.isActive).length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    });
  }, [users, searchQuery, roleFilter]);

  const openCreateModal = () => {
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewPhone('');
    setNewRole('user');
    setNewPermissions(getDefaultPermissionsForRole('user'));
    setFeedback(null);
    setShowCreateModal(true);
  };

  const handleNewRoleChange = (role: FirebaseUserRole) => {
    setNewRole(role);
    setNewPermissions(getDefaultPermissionsForRole(role));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!newName.trim() || !newEmail.trim() || newPassword.length < 6) {
      setFeedback({
        type: 'error',
        text: 'Name, valid email, and password (minimum 6 characters) are required.',
      });
      return;
    }

    setCreating(true);
    const res = await createStaffUser({
      name: newName,
      email: newEmail,
      password: newPassword,
      phone: newPhone,
      role: newRole,
      permissions: newPermissions,
    });
    setCreating(false);

    if (res.success) {
      setShowCreateModal(false);
      setFeedback({
        type: 'success',
        text: `Firebase account created for ${newName.trim()} (${newRole.toUpperCase()})!`,
      });
    } else {
      setFeedback({
        type: 'error',
        text: res.error || 'Failed to create Firebase user.',
      });
    }
  };

  const openEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPhone(user.phone || '');
    setEditRole(user.role);
    setEditActive(user.isActive);
    setEditPermissions(normalizePermissions(user.role, user.permissions));
    setFeedback(null);
  };

  const handleEditRoleChange = (role: FirebaseUserRole) => {
    setEditRole(role);
    setEditPermissions(getDefaultPermissionsForRole(role));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);
    const res = await updateStaffUser(editingUser.uid, {
      name: editName,
      phone: editPhone,
      role: editRole,
      isActive: editActive,
      permissions: editPermissions,
    });
    setSavingEdit(false);

    if (res.success) {
      setEditingUser(null);
      setFeedback({
        type: 'success',
        text: `Updated access permissions and role for ${editName} in Firestore!`,
      });
    } else {
      setFeedback({
        type: 'error',
        text: res.error || 'Failed to update user.',
      });
    }
  };

  const handleQuickToggleActive = async (user: UserAccount) => {
    if (user.uid === currentUser?.uid) return;
    const res = await updateStaffUser(user.uid, { isActive: !user.isActive });
    if (!res.success && res.error) {
      setFeedback({ type: 'error', text: res.error });
    }
  };

  const handleDeleteUser = async (user: UserAccount) => {
    if (user.uid === currentUser?.uid) return;
    if (
      !confirm(
        `Revoke and remove "${user.name}" (${user.email})? They will immediately lose access to the application.`
      )
    ) {
      return;
    }
    const res = await deleteStaffUser(user.uid);
    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Removed access for ${user.name} (${user.email}).`,
      });
    } else if (res.error) {
      setFeedback({ type: 'error', text: res.error });
    }
  };

  const renderPermissionMatrix = (
    role: FirebaseUserRole,
    perms: UserPermissions,
    setPerms: React.Dispatch<React.SetStateAction<UserPermissions>>
  ) => {
    const isRoleAdmin = role === 'admin';

    const toggleModule = (key: keyof ModulePermissions) => {
      if (isRoleAdmin) return;
      setPerms((prev) => ({
        ...prev,
        modules: {
          ...prev.modules,
          [key]: !prev.modules[key],
        },
      }));
    };

    const toggleAction = (key: keyof ActionPermissions) => {
      if (isRoleAdmin) return;
      setPerms((prev) => ({
        ...prev,
        actions: {
          ...prev.actions,
          [key]: !prev.actions[key],
        },
      }));
    };

    const applyPreset = (preset: 'all' | 'pos_only') => {
      if (isRoleAdmin) return;
      if (preset === 'all') {
        setPerms(getDefaultPermissionsForRole('admin'));
      } else {
        setPerms(getDefaultPermissionsForRole('user'));
      }
    };

    return (
      <div className="space-y-4">
        {isRoleAdmin ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Admin accounts automatically hold full unrestricted access across all modules, actions, and staff controls.
            </span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                {isBn ? 'মডিউল ও ফিচার অ্যাক্সেস কন্ট্রোল' : 'Granular Access Control'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPerms(getDefaultPermissionsForRole(role))}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset {role} Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('all')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                >
                  Allow All
                </button>
              </div>
            </div>

            {/* Module Access Toggles */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">
                {isBn ? '১. পেজ / মডিউল অ্যাক্সেস' : '1. Page & Module Access'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MODULE_PERMISSION_LIST.map((mod) => {
                  const enabled = Boolean(perms.modules[mod.key]);
                  return (
                    <button
                      key={mod.key}
                      type="button"
                      onClick={() => toggleModule(mod.key)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                        enabled
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-xs block truncate">
                          {isBn ? mod.labelBn : mod.label}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {mod.description}
                        </span>
                      </div>
                      <div
                        className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                          enabled ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                            enabled ? 'right-0.5' : 'left-0.5'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Permissions Toggles */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-white block">
                {isBn ? '২. স্পেশাল অ্যাকশন পারমিশন' : '2. Action & Data Permissions'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ACTION_PERMISSION_LIST.map((act) => {
                  const enabled = Boolean(perms.actions[act.key]);
                  return (
                    <button
                      key={act.key}
                      type="button"
                      onClick={() => toggleAction(act.key)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                        enabled
                          ? 'bg-blue-500/10 border-blue-500/40 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-xs block truncate">
                          {isBn ? act.labelBn : act.label}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {act.description}
                        </span>
                      </div>
                      <div
                        className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                          enabled ? 'bg-blue-500' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                            enabled ? 'right-0.5' : 'left-0.5'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 lg:pb-12 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>{isBn ? 'ফায়ারবেস অ্যাডমিন ও অ্যাক্সেস কন্ট্রোল' : 'Firebase Admin & Access Control'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isBn
              ? 'শুধুমাত্র অ্যাডমিন নতুন Manager ও User অ্যাকাউন্ট খুলতে পারবেন এবং সবার পেজ ও ফিচার অ্যাক্সেস নিয়ন্ত্রণ করতে পারবেন।'
              : 'Create Manager & User accounts via Firebase Auth and control every module and action permission in real time.'}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isBn ? '+ নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create Manager / User Account'}</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block">Total Accounts</span>
          <span className="font-mono text-xl font-bold text-white mt-1 block">{stats.total}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block">Admins</span>
          <span className="font-mono text-xl font-bold text-emerald-400 mt-1 block">{stats.admins}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block">Managers</span>
          <span className="font-mono text-xl font-bold text-blue-400 mt-1 block">{stats.managers}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-400 block">Users / Staff</span>
          <span className="font-mono text-xl font-bold text-purple-400 mt-1 block">{stats.regularUsers}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-slate-400 block">Suspended</span>
          <span className="font-mono text-xl font-bold text-rose-400 mt-1 block">{stats.suspended}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, email, or phone..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          {(['all', 'admin', 'manager', 'user'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
                roleFilter === r
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Accounts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map((u) => {
          const enabledModulesCount = Object.values(u.permissions?.modules || {}).filter(Boolean).length;
          const totalModulesCount = MODULE_PERMISSION_LIST.length;
          const enabledActionsCount = Object.values(u.permissions?.actions || {}).filter(Boolean).length;
          const totalActionsCount = ACTION_PERMISSION_LIST.length;
          const isSelf = u.uid === currentUser?.uid;
          const isRoot = u.email.toLowerCase() === ROOT_ADMIN_EMAIL;

          return (
            <div
              key={u.uid}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                u.isActive
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-900/50 border-rose-900/50 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      u.role === 'admin'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : u.role === 'manager'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}
                  >
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-bold text-sm text-white truncate">{u.name}</h3>
                      {isSelf && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          YOU
                        </span>
                      )}
                      {isRoot && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ROOT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate">{u.email}</p>
                    {u.phone && (
                      <p className="text-[11px] text-slate-500 font-mono">{u.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      u.role === 'admin'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : u.role === 'manager'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    {u.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                      u.isActive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {u.isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Suspended
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Access Summary Strip */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    Modules:{' '}
                    <strong className="text-white font-mono">
                      {u.role === 'admin' ? `${totalModulesCount}/${totalModulesCount}` : `${enabledModulesCount}/${totalModulesCount}`}
                    </strong>
                  </span>
                  <span className="text-slate-400">
                    Actions:{' '}
                    <strong className="text-white font-mono">
                      {u.role === 'admin' ? `${totalActionsCount}/${totalActionsCount}` : `${enabledActionsCount}/${totalActionsCount}`}
                    </strong>
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {u.last_login
                    ? `Last seen: ${new Date(u.last_login).toLocaleDateString()}`
                    : 'Not logged in yet'}
                </span>
              </div>

              {/* Quick Module Chips Preview */}
              <div className="flex flex-wrap gap-1">
                {MODULE_PERMISSION_LIST.filter((m) =>
                  u.role === 'admin' ? true : u.permissions?.modules?.[m.key]
                )
                  .slice(0, 6)
                  .map((m) => (
                    <span
                      key={m.key}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700/60"
                    >
                      {isBn ? m.labelBn : m.label}
                    </span>
                  ))}
                {u.role !== 'admin' && enabledModulesCount > 6 && (
                  <span className="px-2 py-0.5 rounded bg-slate-800/60 text-emerald-400 text-[10px]">
                    +{enabledModulesCount - 6} more
                  </span>
                )}
              </div>

              {/* Footer Controls */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => openEditModal(u)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isBn ? 'অ্যাক্সেস ও রোল কন্ট্রোল' : 'Edit Access & Role'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {!isSelf && !isRoot && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickToggleActive(u)}
                        className={`px-2.5 py-1.5 rounded-xl font-semibold border transition-colors flex items-center gap-1 ${
                          u.isActive
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                        title={u.isActive ? 'Suspend account' : 'Activate account'}
                      >
                        {u.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        <span>{u.isActive ? 'Suspend' : 'Activate'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors"
                        title="Revoke & Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Staff User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    {isBn ? 'নতুন স্টাফ / ম্যানেজার অ্যাকাউন্ট তৈরি' : 'Create New Firebase Staff Account'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Admin-only creation — configures Firebase Auth login & Firestore permissions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Rahim Manager"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Login Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="staff@shop.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Password (min 6 chars) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Picker */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Account Role</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['user', 'manager', 'admin'] as FirebaseUserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleNewRoleChange(r)}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        newRole === r
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-xs uppercase block">{r}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {r === 'admin'
                          ? 'Full Control'
                          : r === 'manager'
                          ? 'Operations & Stock'
                          : 'POS & Basic Sales'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions Matrix */}
              {renderPermissionMatrix(newRole, newPermissions, setNewPermissions)}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-lg flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{creating ? 'Creating Account...' : 'Create Firebase Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Permissions Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    Access Control: {editingUser.name}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">{editingUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Account Status</label>
                  <button
                    type="button"
                    disabled={editingUser.uid === currentUser?.uid}
                    onClick={() => setEditActive(!editActive)}
                    className={`w-full py-2 px-3 rounded-xl font-bold border flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 ${
                      editActive
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {editActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    <span>{editActive ? 'Active (Allowed)' : 'Suspended (Blocked)'}</span>
                  </button>
                </div>
              </div>

              {/* Role Switch */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-semibold">Assigned Role</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['user', 'manager', 'admin'] as FirebaseUserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      disabled={editingUser.email.toLowerCase() === ROOT_ADMIN_EMAIL && r !== 'admin'}
                      onClick={() => handleEditRoleChange(r)}
                      className={`p-2.5 rounded-xl border text-left transition-colors disabled:opacity-40 ${
                        editRole === r
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="font-bold text-xs uppercase block">{r}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Permissions */}
              {renderPermissionMatrix(editRole, editPermissions, setEditPermissions)}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingEdit ? 'Saving to Firestore...' : 'Save Access Controls'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
