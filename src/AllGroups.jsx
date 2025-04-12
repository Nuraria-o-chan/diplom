import React from "react";

const AllGroups = () => {
  const handleFileSubmit = (e) => {
    e.preventDefault();
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, { type: "buffer" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];

      // Находим все объединенные ячейки, начинающиеся в строке 0 (названия групп)
      const groupRanges =
        worksheet["!merges"]?.filter((x) => x["s"]["r"] === 0) || [];

      const allGroups = []; // Массив для хранения данных обо всех группах

      // Итерируемся по диапазонам групп
      groupRanges.forEach((groupRange) => {
        const groupName =
          worksheet[
            XLSX.utils.encode_cell({ r: groupRange.s.r, c: groupRange.s.c })
          ]?.v?.toString() || "Без названия";
        const dataRangeValues = [];

        // Итерируемся по строкам, пока не дойдем до конца данных группы
        let R = groupRange.s.r + 2;
        while (true) {
          // Собираем данные для текущей пары
          let cellNumber = { c: groupRange.s.c + 1, r: R }; // Изменили const на let
          let dataRa = XLSX.utils.encode_cell(cellNumber); // Изменили const на let
          const para = new Para();

          para.number = worksheet[dataRa]?.v || "";

          cellNumber = { c: groupRange.s.c + 3, r: R }; // Изменили const на let
          dataRa = XLSX.utils.encode_cell(cellNumber); // Изменили const на let
          para.name = worksheet[dataRa]?.v || "";

          cellNumber = { c: groupRange.s.c + 2, r: R }; // Изменили const на let
          dataRa = XLSX.utils.encode_cell(cellNumber); // Изменили const на let
          para.disciplina = worksheet[dataRa]?.v || "";

          cellNumber = { c: groupRange.s.c + 4, r: R }; // Изменили const на let
          dataRa = XLSX.utils.encode_cell(cellNumber); // Изменили const на let
          para.prepod = worksheet[dataRa]?.v || "";

          cellNumber = { c: groupRange.s.c + 5, r: R }; // Изменили const на let
          dataRa = XLSX.utils.encode_cell(cellNumber); // Изменили const на let
          para.kab = worksheet[dataRa]?.v || "";

          // Если все данные в строке пустые, считаем, что это конец группы
          if (
            !para.number &&
            !para.name &&
            !para.disciplina &&
            !para.prepod &&
            !para.kab
          ) {
            break; // Выходим из цикла while
          }

          dataRangeValues.push(para);
          R++; // Переходим к следующей строке
        }

        // Создаем объект Group
        const newGroup = {
          Name: groupName,
          paras: dataRangeValues,
        };

        allGroups.push(newGroup);
      });

      // Устанавливаем состояние groups
      setGroups(allGroups);
      console.log(allGroups);
    }
  };

  return <div></div>;
};

export default AllGroups;
