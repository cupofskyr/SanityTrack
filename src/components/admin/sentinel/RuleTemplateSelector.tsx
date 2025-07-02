type Template = { name: string; description: string };
type RuleTemplateSelectorProps = {
  onSelectTemplate: (template: Template) => void;
};
export default function RuleTemplateSelector({ onSelectTemplate }: RuleTemplateSelectorProps) {
  const templates: Template[] = [
    { name: "Low Inventory Alert", description: "Notifies manager when stock is low." },
    { name: "Spill Detection Task", description: "Creates a task when a spill is detected." },
  ];
  return (
    <div>
      <h3 className="font-bold mb-2">Select a Template</h3>
      <div className="space-y-2">
        {templates.map((tmpl) => (
          <div key={tmpl.name} className="p-2 border rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{tmpl.name}</p>
              <p className="text-sm text-gray-500">{tmpl.description}</p>
            </div>
            <button onClick={() => onSelectTemplate(tmpl)} className="px-3 py-1 bg-blue-500 text-white rounded">
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
