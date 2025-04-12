import React from 'react';
import DayComponent from "./DayComponent";

function GroupComponent(props) {
    const { group } = props;

    return (
        <div className="group-container">
            <h2>{group.Name}</h2>
            {group.days && group.days.length > 0 ? (
                group.days.map((day, index) => (
                    day ? <DayComponent key={index} day={day} /> : null //  <-- Проверка на null или undefined
                ))
            ) : (
                <p>Нет данных об учебных днях.</p>
            )}
        </div>
    );
}

export default GroupComponent;