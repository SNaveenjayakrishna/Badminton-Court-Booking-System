import "./EquipmentSelector.css";

function EquipmentSelector({ equipment, selectedEquipment, onSelectEquipment, availability }) {
  const toggleEquipment = (item) => {
    if (selectedEquipment.find((e) => e.id === item.id)) {
      onSelectEquipment(selectedEquipment.filter((e) => e.id !== item.id));
    } else {
      onSelectEquipment([...selectedEquipment, item]);
    }
  };

  return (
    <div className="equipment-card">
      <h3>Select Equipment</h3>
      {equipment.map(item => {
  const bookedQty = availability.equipment_count[item.id] || 0;
  const remainingQty = item.quantity - bookedQty;
  const isDisabled = remainingQty <= 0;

  return (
    <label
      className={`equipment-item ${isDisabled ? "disabled" : ""}`}
      key={item.id}
    >
      <input
        type="checkbox"
        checked={!!selectedEquipment.find(e => e.id === item.id)}
        onChange={() => !isDisabled && toggleEquipment(item)}
        disabled={isDisabled}
      />
      {item.name} {isDisabled ? "(Out of stock)" : `(Available: ${remainingQty})`}
    </label>
  );
})}

    </div>
  );
}

export default EquipmentSelector;
