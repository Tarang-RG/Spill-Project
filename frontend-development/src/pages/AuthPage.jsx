import Left from "../components/Left";
import Right from "../components/Right";

export default function AuthPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <Left />
      <Right />
    </div>
  );
}