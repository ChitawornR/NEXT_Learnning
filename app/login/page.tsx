import LoginForm from "../components/LoginForm";

export default async function Page() {
    return (
        <div>
            <h1 className="text-5xl text-red-500">Login</h1>
            <LoginForm />
        </div>
    );
}