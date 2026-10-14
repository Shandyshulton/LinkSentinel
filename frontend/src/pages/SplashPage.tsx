import { useNavigate } from "react-router-dom";
import { Screen } from "../components/Screen";
import { Button } from "../components/Button";
import styles from "./SplashPage.module.css";

export function SplashPage() {
  const navigate = useNavigate();

  return (
    <Screen>
      <div className={styles.wrap}>
        <div className={styles.center}>
          <div className={styles.logo}>LS</div>
          <h1 className={styles.title}>LinkSentinel</h1>
          <p className={styles.tagline}>
            Kenali risiko phishing
            <br />
            sebelum membuka tautan.
          </p>
        </div>

        <div className={styles.footer}>
          <Button fullWidth onClick={() => navigate("/home")}>
            Mulai periksa URL
          </Button>
          <p className={styles.disclaimer}>
            Pemeriksaan membantu menilai risiko,
            <br />
            bukan menjamin keamanan tautan.
          </p>
        </div>
      </div>
    </Screen>
  );
}
