var main = (function () {
  var data = [
    "Aprender a volar es todo un arte",
    "Aunque sólo hay que cogerle el truco",
    "Consiste en tirarse al suelo y fallar",
    "El tiempo es una ilusión Y la hora de comer",
    "La vida... No me hables de la vida"
  ];

  let network;
  let dictionary = [];
  let neuronsNumber = 0;

  const encodeData = (data) => {
    const splitted = data.map((e) => e.split(" "));
    const dict = splitted.reduce((acc, dt) => {
      for (let index in dt) {
        if (acc.indexOf(dt[index]) === -1) {
          acc.push(dt[index]);
        }
      }
      return acc;
    }, [""]);

    const dictionary = dict.reduce((acc, entry, index) => {
      acc[entry] = Array(Object.keys(dict).length).fill(0);
      acc[entry][index] = 1;
      return acc;
    }, {});
    log('Diccionario construido:');
    log(JSON.stringify(dictionary));
    const encoded = data.map((dt) => encodeStr(dt, dictionary));
    log('Datos codificados:');
    log(JSON.stringify(encoded));
    return {dict:dictionary, encoded};
  };

  const encodeStr = (str, dict) =>
    str.split(" ")
       .reduce((acc, word) => acc.concat(dict[word]),
         []);

  const decodeArr = (arr, dict) => {
    const chunkSize = Object.keys(dict).length;
    const reversedDict = Object.keys(dict).reduce(function (obj, key) {
      obj[dict[key]] = key;
      return obj;
    }, {});
    let str = "";
    let chunk = arr.splice(0, chunkSize);
    while (chunk.length > 0) {
      str += reversedDict[chunk] + " ";
      chunk = arr.splice(0, chunkSize);
    }
    return str;
  };

  const trainNetwork = (data) => {
    neuronsNumber = data.reduce(((max, arr) => max < arr.length ? arr.length : max), 0);
    log(`Se usara un total de ${neuronsNumber} Neuronas`);
    const network = new synaptic.Architect.Hopfield(neuronsNumber);
    const normalizedData = data.map((arr) => normalize(arr, neuronsNumber, Object.keys(dictionary).length));
    log('Datos de entrenamiento:');
    log(JSON.stringify( network.learn(normalizedData)));
    return network;
  };

  const normalize = (arr,neuronsNumber, wordSize) => {
    const emptyWord = Array(wordSize).fill(0);
    emptyWord[0] = 1;
    while (arr.length < neuronsNumber) {
      arr = arr.concat(emptyWord);
    }
    return arr;
  };


  const init = () => {
    log("Codificando datos...");
    const {dict, encoded} = encodeData(data);
    dictionary = dict;
    log("Datos codificados, entrenando red...");
    network = trainNetwork(encoded);
    log("Red entrenada");
  };

  const log = (message) => {
    var consola = $('.consola');
    consola.append(`<p>${message}</p>`);
    consola.scrollTop(consola[0].scrollHeight);
  };

  const procesar = (texto) => {
    const encoded = encodeStr(texto, dictionary);
    return decodeArr(network.feed(normalize(encoded, neuronsNumber, Object.keys(dictionary).length)), dictionary);
  };

  return {
    init,
    procesar
  }
})();