// Constantes
//

const PATH_SAMPLES = 'kun-leguero/samples/';

// Compases: step_duration 1= Negra, 2=Corchea, 4=Semi-corchea
const TIME_SIGNATURE_NONE_2 = {step_duration: 2, text:{cols: 6, placeholder:'______'}, group:{render_required: false}};
const TIME_SIGNATURE_NONE_4 = {step_duration: 4, text:{cols: 12, placeholder:'____________'}, group:{render_required: false}};

const TIME_SIGNATURE_3_4_2 = {step_duration: 2, text:{cols: 8, placeholder:'__ __ __'},    group:{render_required: true, max_items:2, separator:true}};
const TIME_SIGNATURE_3_4_4 = {step_duration: 4, text:{cols: 14, placeholder:'____ ____ ____'},   group:{render_required: true, max_items:4, separator:true}};

const TIME_SIGNATURE_6_8_2 = {step_duration: 2, text:{cols: 11, placeholder:'_ _ _ _ _ _'},   group:{render_required: true, max_items:1, separator:true}};
const TIME_SIGNATURE_6_8_4 = {step_duration: 4, text:{cols: 17, placeholder:'__ __ __ __ __ __'},   group:{render_required: true, max_items:2, separator:true}};
const TIME_SIGNATURE_6_8_2_BINARY = {step_duration: 2, text:{cols: 7, placeholder:'___ ___'},   group:{render_required: true, max_items:3, separator:true}};
const TIME_SIGNATURE_6_8_4_BINARY = {step_duration: 4, text:{cols: 13, placeholder:'______ ______'},  group:{render_required: true, max_items:6, separator:true}};

// Configuracion de Steps
const STEP_TYPE_ARO     = 'Aro';
const STEP_TYPE_PARCHE  = 'Parche';
const STEP_TYPE_SILENCE = 'Silencio';

const STEP_CONFIGURATION = {
    'A':{
        name: 'Aro Acentuado',
        step_type: STEP_TYPE_ARO,
        sample_name: 'aro_con_acento.ogg',
        audio: new Audio(PATH_SAMPLES+'aro_con_acento.ogg')
    },
    'a': {
        name: 'Aro',
        step_type: STEP_TYPE_ARO,
        sample_name: 'aro_sin_acento.ogg',
        audio: new Audio(PATH_SAMPLES+'aro_sin_acento.ogg')
    },

    'P': {
        name: 'Parche Acentuado',
        step_type: STEP_TYPE_PARCHE,
        sample_name: 'parche_con_acento.ogg',
        audio: new Audio(PATH_SAMPLES+'parche_con_acento.ogg')
    },
    'p': {
        name: 'Parche',
        step_type: STEP_TYPE_ARO,
        sample_name: 'parche_sin_acento.ogg',
        audio: new Audio(PATH_SAMPLES+'parche_sin_acento.ogg')
    },
    // Silencios
    '_':{
        name:'Silencio',
        step_type: STEP_TYPE_SILENCE
    },
    '-':{
        name:'Silencio',
        step_type: STEP_TYPE_SILENCE
    }

};
const PROCESS_PATTERN_REGEX =  /[AaPp_\-]/gm;

// VARs Globales
let isPlaying = false;
let intervalId = null;
let speed = 110;
let currentStep = 0;
let pattern = '';
let time_signature = TIME_SIGNATURE_NONE_2;
let steps_data = [];
let step_highlight = true;

const pattern_textarea  = document.getElementById('pattern');
const start_button      = document.getElementById('start_button');
const configuration_selector = document.getElementById('configuration');
const step_highlight_checkbox = document.getElementById('step_highlight')


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
    render();
    processPatternToStepsData();
    intervalId = setInterval(playStep, 60000 / (speed * time_signature.step_duration));
    playStep();
    isPlaying = true;
  }
}

function selectStepInTextArea(step){
    pattern_textarea.focus();
    pattern_textarea.setSelectionRange(step.position, (step.position + 1));
}

/**
 * Procesa el texto del textarea a una estructura que tiene todo listo!.
 */
function processPatternToStepsData(){
    steps_data = [];
    let m;

    while ((m = PROCESS_PATTERN_REGEX.exec(pattern_textarea.value)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === PROCESS_PATTERN_REGEX.lastIndex) {
            PROCESS_PATTERN_REGEX.lastIndex++;
        }
        let new_step = {...STEP_CONFIGURATION[m]};  // Clonado 
        new_step.position = m.index;

        steps_data.push(new_step);
    }
}

function playStep() {
    let step = steps_data[currentStep];
    if(step_highlight_checkbox.checked){
        selectStepInTextArea(step);
    }

    if(step.step_type !== STEP_TYPE_SILENCE){
        step.audio.play();
    }
  currentStep = (currentStep + 1) % steps_data.length;
}



function render(){
    //Solo si el compás requiere renderizado...
    if(time_signature.group.render_required){
        let max_items =  time_signature.group.max_items;
        let with_separator =  time_signature.group.separator ? ' ':'';
        let new_pattern_text = '';
        for($i=0; $i<pattern.length; $i+=(max_items)){
            new_pattern_text += (pattern.substr($i,max_items) + with_separator);
        }

        pattern_textarea.value = with_separator ? new_pattern_text.substring(0,new_pattern_text.length-1): new_pattern_text;
    }
}

function processPattern(pattern_value,with_render){
    pattern = pattern_value.replace(/[^AaPp_ \-]/g, ''); // Solo permite A, P o "-" y "_"
    if(with_render){render()};
}

/// EVENTOS
document.getElementById('speed').addEventListener('input', function () {
  speed = parseInt(this.value);
  clearInterval(intervalId);
  if (isPlaying) {
    let ms = 60000 / (speed * time_signature.step_duration);
    intervalId = setInterval(playStep, ms);
  }
});

pattern_textarea.addEventListener('input', function () {
    processPattern(this.value,true);
});

/**
 * Ante cambios en la configuracion (de Metricas), se deberá renderizar el patron correspondiente
 */
configuration_selector.addEventListener('change',function () {
    switch(this.value){
        case '0020':    time_signature = TIME_SIGNATURE_NONE_2;
                        break;
        case '0040':    time_signature = TIME_SIGNATURE_NONE_4;
                        break;
        case '3420':    time_signature = TIME_SIGNATURE_3_4_2;
                        break;
        case '3440':    time_signature = TIME_SIGNATURE_3_4_4;
                        break;
        case '6820':    time_signature = TIME_SIGNATURE_6_8_2;
                        break;
        case '6840':    time_signature = TIME_SIGNATURE_6_8_4;
                        break;
        case '6821':    time_signature = TIME_SIGNATURE_6_8_2_BINARY;
                        break;
        case '6841':    time_signature = TIME_SIGNATURE_6_8_4_BINARY;
                        break;


        default:    //NO deberia darse...
    }

    pattern_textarea.cols = time_signature.text.cols;
    pattern_textarea.placeholder = time_signature.text.placeholder;

    processPattern(pattern_textarea.value,true)

});

window.addEventListener("load", (event) => {
    // Se toma el valor del patron
    processPattern(pattern_textarea.value, true)
});

document.addEventListener("visibilitychange", () => {
    if(document.hidden){
        stop();
    }
});
