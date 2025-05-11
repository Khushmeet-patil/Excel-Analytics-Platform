import { theme } from '../../theme';

export default function Features() {
  const features = [
    {
      title: "AI-Powered Editing",
      description: "Let AI help you clean, transform, and enhance your Excel data with natural language commands.",
      icon: "✨"
    },
    {
      title: "3D Visualization",
      description: "Turn complex datasets into interactive 3D visualizations that reveal hidden patterns and insights.",
      icon: "📊"
    },
    {
      title: "Smart Analysis",
      description: "Get automated insights, trend detection, and predictive analytics from your spreadsheet data.",
      icon: "🧠"
    }
  ];

  return (
    <section className="py-16" style={{ backgroundColor: theme.colors.background.paper }}>
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: theme.colors.text.primary }}>Powerful Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg shadow-md" style={{ backgroundColor: theme.colors.background.default }}>
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text.primary }}>{feature.title}</h3>
              <p style={{ color: theme.colors.text.secondary }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}