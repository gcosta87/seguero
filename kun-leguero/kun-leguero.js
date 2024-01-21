
let isPlaying = false;
let intervalId = null;
let speed = 110;
let currentStep = 0;
let pattern = '';
let step_duration = 4;    //1= Negra, 2=Corchea, 4=Semi-corchea

const pattern_textarea  = document.getElementById('pattern');
const start_button      = document.getElementById('start_button');
const configuration_selector = document.getElementById('configuration');

function stop(){
    clearInterval(intervalId);
    start_button.textContent= "Comenzar";
    isPlaying = false;
    currentStep = 0;
}

function startStop() {

  if (isPlaying) {
    stop();
  } else {
    start_button.textContent= (currentStep == 0 ? "Detener" : "Comenzar");
    intervalId = setInterval(playStep, 60000 / (speed * step_duration));
    playStep();
    isPlaying = true;
  }
}

function selectStepInTextArea(step){
    let regex = new RegExp("(?<=(?:[\s\n]*[AaPp_\-][\s\n]*){"+currentStep+"})"+step,"");
    let m;

    if ((m = regex.exec(pattern_textarea.value)) !== null) {
        // The result can be accessed through the `m`-variable.
        pattern_textarea.focus();
        pattern_textarea.setSelectionRange(m.index, (m.index + 1));
    }
}

function playStep() {
  const step = pattern[currentStep];
  selectStepInTextArea(step);
  switch(step){
    case 'A':   playSound('kun-leguero/samples/aro_con_acento.ogg');
                break;
    case 'a':   playSound('kun-leguero/samples/aro_sin_acento.ogg');
                break;

    case 'P':   playSound('kun-leguero/samples/parche_con_acento.ogg');
                break;
    case 'p':   playSound('kun-leguero/samples/parche_sin_acento.ogg');
                break;
    default: // Silencio
  }
  currentStep = (currentStep + 1) % pattern.length;
}

function playSound(soundFile) {
  const audio = new Audio(soundFile);
  audio.play();
}



function render(){
    //ACa se deberia acomodar el texto segun la configuracion
}

function processPattern(pattern_value){
    pattern = pattern_value.replace(/[^AaPp_\-]/g, ''); // Solo permite A, P o "-" y "_"
    render();
}

/// EVENTOS
document.getElementById('speed').addEventListener('input', function () {
  speed = parseInt(this.value);
  clearInterval(intervalId);
  if (isPlaying) {
    let ms = 60000 / (speed * step_duration);
    intervalId = setInterval(playStep, ms);
  }
});

pattern_textarea.addEventListener('input', function () {
    processPattern(this.value);
});


configuration_selector.addEventListener('change',function () {
   step_duration = this.value[2];   // Se queda con el ultimo valor del value ("34X")
});

window.addEventListener("load", (event) => {
    // Se toma el valor del patron
    var patter_value = pattern_textarea.value;
    processPattern(patter_value)
});

document.addEventListener("visibilitychange", () => {
    if(document.hidden){
        stop();
    }
});
