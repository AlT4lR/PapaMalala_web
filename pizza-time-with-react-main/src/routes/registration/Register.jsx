import React, { useEffect, useState, useRef } from "react";
import validateForm from "../../components/validateForm";
import { v4 as uuidv4 } from "uuid";
import ResetLocation from "../../helpers/ResetLocation";
import "./register.css";
import {
  CAPTCHA_KEY,
  CAPTCHA_SECRET,
  CAPTCHA_URL,
  USERS_URL,
} from "../../data/constants";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
const initialFormValue = {
  id: "",
  email: "",
  password: "",
  repeatPassword: "",
  fullname: "",
  address: "",
  number: "",
};
const Register = ({ activateLoginModal }) => {
  console.log("[Register] render");
  const [visible, setVisible] = useState(true);
  const [formValue, setFormValue] = useState(initialFormValue);
  const [formError, setFormError] = useState({});
  const [submit, setSubmit] = useState(false);
  const [registrationFail, setRegistrationFail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeError, setAgreeError] = useState("");

  const captchaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Registration | PAPA JES’S PIZZAHOUSE";
    console.log("[Register] mounted");
    return () => console.log("[Register] unmounted");
  }, []);

  const getUsers = async () => {
    try {
      if (!USERS_URL) return [];
      const response = await fetch(USERS_URL);
      if (response.status === 429) throw new Error("Too many requests");
      const body = await response.json();
      return Array.isArray(body?.data) ? body.data : [];
    } catch (err) {
      console.error("getUsers failed:", err?.message || err);
      return [];
    }
  };

  const createUser = async (user) => {
    try {
      if (!USERS_URL) return false;
      const users = await getUsers();
      const repetitiveEmail = Array.isArray(users) && users.some((u) => u.email === user.email);
      if (repetitiveEmail) return false;
      user.id = uuidv4();
      const response = await fetch(USERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (response.status === 429) throw new Error("Too many requests");
      return response.ok;
    } catch (err) {
      console.error("createUser failed:", err?.message || err);
      return false;
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      ResetLocation();
      const errors = validate(formValue);
      setFormError(errors);
      if (Object.keys(errors).length > 0) return;

      const captchaToken = captchaRef.current?.getValue?.() || null;
      const captchaVerified = await verifyCaptcha(captchaToken);
      // Terms checkbox validation
      if (!agreeTerms) {
        setAgreeError("You must agree to the Terms and Privacy to continue.");
        return;
      }
      if (!captchaVerified) {
        setCaptchaError("reCaptcha is mandatory");
        setSubmit(false);
        return;
      }

      const currForm = { ...formValue };
      delete currForm.repeatPassword;
      if (!currForm.address) delete currForm.address;
      if (!currForm.number) delete currForm.number;
      currForm.email = (currForm.email || "").toLowerCase();

      const accCreation = await createUser(currForm);
      if (!accCreation) {
        setRegistrationFail(true);
        setSubmit(false);
      } else {
        setRegistrationFail(false);
        setSubmit(true);
      }
    } catch (err) {
      console.error("handleSubmit error:", err?.message || err);
    } finally {
      setLoading(false);
      setCaptchaError("");
      setFormValue(initialFormValue);
    }
  };
  const updateForm = (e) => {
    const { name, value } = e.target;
    setFormValue({ ...formValue, [name]: value });
  };
  const validate = validateForm("registration");

  const verifyCaptcha = async (captchaToken) => {
    // If there's no captcha configured, treat as verified in dev/local.
    if (!CAPTCHA_URL || !CAPTCHA_SECRET) return true;
    if (!captchaToken) {
      try { captchaRef.current?.reset?.(); } catch (e) {}
      return false;
    }
    try {
      const response = await fetch(CAPTCHA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: CAPTCHA_SECRET, captchaToken }),
      });
      if (!response.ok) {
        console.error("Captcha verify failed: ", await response.text().catch(() => response.statusText));
        return false;
      }
      return true;
    } catch (err) {
      console.error("Could not verify captcha!", err?.message || err);
      return false;
    } finally {
      try { captchaRef.current?.reset?.(); } catch (e) {}
    }
  };
  // Simple presentational layout (no animation) to make the component stable
  const header = submit && Object.keys(formError).length === 0 ? "Success!" : "Registration";

  if (!visible) return null;

  return (
    <main className="register">
      <div className="register__inner">
        <h2>{header}</h2>

        {loading ? (
          <div role="status" className="loader">
            <p>Almost there...</p>
          </div>
        ) : submit && Object.keys(formError).length === 0 ? (
          <section className="register__success">
            <p>You can now log in and make an order!</p>
            <button
              className="passive-button-style txt-white"
              onClick={() => {
                // hide registration panel first so it disappears immediately
                setVisible(false);
                // open login modal
                ResetLocation();
                activateLoginModal?.();
                setSubmit(false);
                // try to navigate away in case the Register route is active
                try {
                  navigate("/");
                } catch (e) {
                  // fallback: no-op if navigation fails
                }
              }}
            >
              Log in
            </button>
          </section>
        ) : (
          <form className="register__form" onSubmit={handleSubmit}>
            {registrationFail && <p className="register__error">Seems like this email has already been registered!</p>}

            <label className="register__form__field">Full name
              <input name="fullname" value={formValue.fullname} onChange={updateForm} placeholder="Full name" />
            </label>
            <span className="register__error">{formError.fullname}</span>

            <label className="register__form__field">Email
              <input name="email" value={formValue.email} onChange={updateForm} placeholder="email@example.com" />
            </label>
            <span className="register__error">{formError.email}</span>

            <label className="register__form__field">Password
              <input type="password" name="password" value={formValue.password} onChange={updateForm} placeholder="Password" />
            </label>
            <span className="register__error">{formError.password}</span>

            <label className="register__form__field">Repeat Password
              <input type="password" name="repeatPassword" value={formValue.repeatPassword} onChange={updateForm} placeholder="Repeat password" />
            </label>
            <span className="register__error">{formError.repeatPassword}</span>

            <label className="register__form__field">Address (optional)
              <input name="address" value={formValue.address} onChange={updateForm} placeholder="Street address" />
            </label>

            <label className="register__form__field">Phone (optional)
              <input name="number" value={formValue.number} onChange={updateForm} placeholder="Phone number" />
            </label>

            <div className="terms-row">
              <label className="register__form__field terms-checkbox">
                <input type="checkbox" name="agreeTerms" checked={agreeTerms} onChange={(e) => { setAgreeTerms(e.target.checked); if (e.target.checked) setAgreeError(""); }} />
                <span>By clicking "Sign Up" you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy</Link>.</span>
              </label>
              {agreeError && <span className="register__error" role="alert">{agreeError}</span>}
            </div>

            {/* ReCAPTCHA is optional — if not configured we'll skip verification */}
            {CAPTCHA_KEY ? (
              <ReCAPTCHA ref={captchaRef} sitekey={CAPTCHA_KEY} theme="dark" />
            ) : null}

            <span className="captcha-input-validation-error">{captchaError}</span>

            <button className="register__submit" type="submit">Sign up</button>
          </form>
        )}
      </div>
    </main>
  );
};

export default Register;
