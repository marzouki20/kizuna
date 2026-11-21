import { useState } from "react";
import { Bot, Eye, EyeOff, LockKeyhole, Mail, Sprout } from "lucide-react";
import { useAuth } from "../auth/useAuth";
import "./Login.css";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try { await signIn(email.trim(), password, rememberMe); }
    catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Parcelles agricoles RoboCore">
        <div className="visual-image" />
        <div className="visual-shade" />
        <div className="visual-brand"><span className="brand-mark"><Bot size={27} /></span><span>RoboCore</span></div>
        <div className="visual-copy">
          <span className="visual-eyebrow"><Sprout size={15} /> AGRICULTURE, REIMAGINED</span>
          <h1>Grow smarter.<br />Harvest better.</h1>
          <p>Smart Farming. Intelligent Detection. Precision Treatment.</p>
        </div>
        <div className="visual-caption"><span /> Precision technology for healthier crops</div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-mobile-brand"><span className="brand-mark"><Bot size={24} /></span><span>RoboCore</span></div>
          <div className="login-heading">
            <span className="login-kicker">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to access your farm workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Email address</label>
            <div className="login-input-wrap"><Mail size={18} /><input id="email" type="email" autoComplete="username" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>

            <label htmlFor="password">Password</label>
            <div className="login-input-wrap"><LockKeyhole size={18} /><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>

            <div className="login-options"><label className="remember-option"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Remember me</span></label><a href="mailto:support@robocore.local?subject=Password%20reset">Forgot password?</a></div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button className="sign-in-button" type="submit" disabled={submitting}>{submitting && <span className="login-spinner" />}{submitting ? "Signing in…" : "Sign In"}</button>
          </form>

          <div className="demo-note"><span className="demo-dot" /><div><strong>Demonstration access</strong><p>Demo mode · No production account system connected</p><p>Email: admin@robocore.local · Password: RoboCoreDemo2026!</p></div></div>
          <p className="login-footer">© 2026 RoboCore <span>•</span> Smart Agriculture Platform</p>
        </div>
      </section>
    </main>
  );
}
