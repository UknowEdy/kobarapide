export default function ClientDashboard({ user }: any) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-koba-accent">Dashboard</h2>
      <p className="text-koba-text mt-4">Bienvenue {user?.prenom} {user?.nom}</p>
    </div>
  );
}
