function getValue(id) {
  return document.getElementById(id).value.trim() || "未填写";
}

function setField(id, value) {
  if (value) {
    document.getElementById(id).value = value;
  }
}

function splitRawInfo(text) {
  return text
    .replace(/[；;]/g, "，")
    .replace(/[。！？!?]/g, "\n")
    .split(/[\n，,]/)
    .map(function (item) {
      return item.trim();
    })
    .filter(Boolean);
}

function uniqueJoin(items) {
  return Array.from(new Set(items)).join("；");
}

function normalizeObservation(items) {
  var text = uniqueJoin(items);
  return text
    .replace(/患者/g, "")
    .replace(/夜间睡眠一般/g, "夜间睡眠一般")
    .trim();
}

function summarizeNursingInfo() {
  var rawInfo = document.getElementById("rawNursingInfo").value.trim();
  var statusText = document.getElementById("statusText");

  if (!rawInfo) {
    statusText.textContent = "请先输入需要整理的护理信息。";
    return;
  }

  var fragments = splitRawInfo(rawInfo);
  var vitalSigns = [];
  var treatment = [];
  var observation = [];

  fragments.forEach(function (item) {
    if (/血氧|SpO2|spo2|体温|T\s*\d|脉搏|心率|P\s*\d|呼吸|R\s*\d|血压|BP/i.test(item)) {
      vitalSigns.push(item);
    }

    if (/吸氧|氧疗|低流量|高流量|输液|用药|雾化|抗感染|治疗|换药|导管|引流|留置/i.test(item)) {
      treatment.push(item);
    }

    if (/睡眠|咳嗽|咳痰|痰|疼痛|恶心|呕吐|腹胀|发热|出血|皮肤|压疮|意识|饮食|排尿|排便|活动|跌倒|坠床/i.test(item)) {
      observation.push(item);
    }
  });

  if (vitalSigns.length === 0) {
    vitalSigns.push("生命体征未见明确描述，请补充体温、脉搏、呼吸、血压及血氧等信息");
  }

  if (treatment.length === 0) {
    treatment.push("治疗情况未见明确描述，请补充当前治疗、用药及护理措施");
  }

  if (observation.length === 0) {
    observation.push(uniqueJoin(fragments));
  }

  setField("vitalSigns", uniqueJoin(vitalSigns));
  setField("treatment", uniqueJoin(treatment));
  setField("observation", normalizeObservation(observation));

  generateHandover();
  statusText.textContent = "AI总结已完成，请核对后使用。";
}

function generateHandover() {
  const bedNumber = getValue("bedNumber");
  const patientName = getValue("patientName");
  const diagnosis = getValue("diagnosis");
  const vitalSigns = getValue("vitalSigns");
  const treatment = getValue("treatment");
  const observation = getValue("observation");

  const handoverText =
`${bedNumber} ${patientName}

诊断：
${diagnosis}

生命体征：
${vitalSigns}

治疗情况：
${treatment}

特殊观察：
${observation}

交班护士：

---`;

  document.getElementById("handoverOutput").value = handoverText;
  document.getElementById("statusText").textContent = "交班记录已生成。";
}

function clearForm() {
  const fields = [
    "rawNursingInfo",
    "bedNumber",
    "patientName",
    "diagnosis",
    "vitalSigns",
    "treatment",
    "observation",
    "handoverOutput"
  ];

  fields.forEach(function (id) {
    document.getElementById(id).value = "";
  });

  document.getElementById("statusText").textContent = "请根据实际病情核对后再用于护理文书。";
}

async function copyHandover() {
  const output = document.getElementById("handoverOutput").value.trim();
  const statusText = document.getElementById("statusText");

  if (!output) {
    statusText.textContent = "请先生成交班记录。";
    return;
  }

  try {
    await navigator.clipboard.writeText(output);
    statusText.textContent = "交班记录已复制。";
  } catch (error) {
    statusText.textContent = "复制失败，请手动选择文本复制。";
  }
}
