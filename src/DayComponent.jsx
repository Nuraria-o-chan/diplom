function DayComponent(props) {
  const { day } = props;

  return (
    <div className="day-container">
      <h3>{day.date}</h3> {/* Отображаем дату */}
    </div>
  );
}

export default DayComponent;
