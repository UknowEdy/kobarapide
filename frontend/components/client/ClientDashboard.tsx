export default function ClientDashboard({ user, loans }: any) {
  return (
    <div className="p-8 bg-koba-bg">
      <h2 className="text-2xl font-bold text-koba-accent">Dashboard Client</h2>
      <p className="text-koba-text mt-4">Bienvenue {user.prenom} {user.nom}</p>
    </div>
  );
}
