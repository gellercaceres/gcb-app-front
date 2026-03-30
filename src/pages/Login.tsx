import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await api.post('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      navigate('/app/dashboard', { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message ??
          error.response?.data?.error ??
          error.message;
        alert(`Error login${status ? ` (${status})` : ''}: ${message}`);
      } else {
        alert('Error login inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-transparent lg:grid-cols-[1.1fr_0.9fr]">
      <aside className="hidden flex-col justify-between bg-gradient-to-br from-[#10293b] via-[#17384d] to-[#214c66] p-10 text-white lg:flex">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0c778]">GCB Commerce</p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight">
            Plataforma de ventas para equipos de alto desempeno
          </h1>
          <p className="mt-4 max-w-md text-sm text-slate-200">
            Monitorea clientes, ordenes y resultados comerciales desde un mismo lugar.
          </p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-sm text-slate-100 backdrop-blur">
          "La velocidad de respuesta comercial subio 35% desde que operamos con este panel."
        </div>
      </aside>

      <div className="flex items-center justify-center px-6 py-10">
        <div className="premium-card w-full max-w-md p-8">
          <p className="premium-kicker">Acceso seguro</p>
          <h2 className="mt-2 mb-5 text-2xl font-semibold text-slate-900">Iniciar sesion</h2>

          <label className="mb-3 block text-sm font-medium text-slate-700">Correo corporativo</label>
          <input
            className="mb-4 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="mb-3 block text-sm font-medium text-slate-700">Contrasena</label>
          <input
            className="mb-5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="premium-button w-full py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Entrar al panel'}
          </button>

          <p className="mt-4 text-xs text-slate-500">
            Protegido con autenticacion JWT y control de acceso por perfil.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;