import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { WebCamRecognition } from '../components/WebCamRecognition/WebCamRecognition';

export default function HomePage() {
  return (
    <>
      <WebCamRecognition />
      <ColorSchemeToggle />
    </>
  );
}
