// Constantes
//

const PATH_SAMPLES = 'kun-leguero/samples/';

// Compases y figuras/notas musicales: step_duration 1= Negra, 2=Corchea, 4=Semi-corchea
const MUSICAL_NOTE_1 = {name: 'Negra', step_duration: 1, note_english: '4n'};
const MUSICAL_NOTE_2 = {name: 'Corchea', step_duration: 2, note_english: '8n'};
const MUSICAL_NOTE_4 = {name: 'Semicorchea', step_duration: 4,  note_english: '16n'};

const TIME_SIGNATURE_NONE_2 = {musical_note: MUSICAL_NOTE_2, text:{cols: 6, placeholder:'______'}, group:{render_required: false}};
const TIME_SIGNATURE_NONE_4 = {musical_note: MUSICAL_NOTE_4, text:{cols: 12, placeholder:'____________'}, group:{render_required: false}};

const TIME_SIGNATURE_3_4_2 = {musical_note: MUSICAL_NOTE_2, text:{cols: 8, placeholder:'__ __ __'},    group:{render_required: true, max_items:2, separator:true}};
const TIME_SIGNATURE_3_4_4 = {musical_note: MUSICAL_NOTE_4, text:{cols: 14, placeholder:'____ ____ ____'},   group:{render_required: true, max_items:4, separator:true}};

const TIME_SIGNATURE_6_8_2 = {musical_note: MUSICAL_NOTE_2, text:{cols: 11, placeholder:'_ _ _ _ _ _'},   group:{render_required: true, max_items:1, separator:true}};
const TIME_SIGNATURE_6_8_4 = {musical_note: MUSICAL_NOTE_4, text:{cols: 17, placeholder:'__ __ __ __ __ __'},   group:{render_required: true, max_items:2, separator:true}};
const TIME_SIGNATURE_6_8_2_BINARY = {musical_note: MUSICAL_NOTE_2, text:{cols: 7, placeholder:'___ ___'},   group:{render_required: true, max_items:3, separator:true}};
const TIME_SIGNATURE_6_8_4_BINARY = {musical_note: MUSICAL_NOTE_4, text:{cols: 13, placeholder:'______ ______'},  group:{render_required: true, max_items:6, separator:true}};

// Configuracion de Steps
const STEP_TYPE_ARO     = 'Aro';
const STEP_TYPE_PARCHE  = 'Parche';
const STEP_TYPE_SILENCE = 'Silencio';

const STEP_CONFIGURATION = {
    'a': {
        name: 'Aro',
        step_type: STEP_TYPE_ARO,
        sample:{file: 'aro_sin_acento.ogg', note_reference:'C4'}
    },

    'A':{
        name: 'Aro Acentuado',
        step_type: STEP_TYPE_ARO,
        sample:{file: 'aro_con_acento.ogg', note_reference:'D4'}
    },

    'p': {
        name: 'Parche',
        step_type: STEP_TYPE_ARO,
        sample: {file:'parche_sin_acento.ogg', note_reference:'E4'}
    },


    'P': {
        name: 'Parche Acentuado',
        step_type: STEP_TYPE_PARCHE,
        sample:{file: 'parche_con_acento.ogg', note_reference:'F4'}
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
let kun_instance = {

    //VARs
    // Se esta reproducioendo?
    __is_playing: false,

    // Se ha reproducido al menos alguna vez?
    __has_played: false,

    // Velocidad
    speed: 110,

    // Patron de texto
    pattern: '',

    // configuracion del compas
    time_signature: TIME_SIGNATURE_NONE_2,

    // Info de los Steps
    __steps:{
        current: 0,
        data: [],
    },

    // Integracion con la libreria
    __tonejs:{
        sampler:    null,
    },

    config: {
        step:{
            highlight : true
        }
    },
    
    development:{
        version: {
            number: "0.5.8",
            cicle: "Pre-Alpha", //Pre-Alpha, Alpha, Beta, RC, Stable
            toString(){
                //return this.number+' ['+(this.cicle === 'Stable' ?  'Estable' : 'Inestable') +']';
                return 'v'+this.number;
            }
        },
        debug: false
    },


    // FUNCIONES
    /**
     * Devuelve la informacion del actual Step
     * @returns
     */
    getCurrentStep: function(){
        return this.__steps.data[this.__steps.current];
    },

    /**
     * Devuelve la informacion del actual Step e incrementa el puntero interno
     * @returns Step
     */
    getNextStep:function(){
        let step = this.getCurrentStep();
        this.__steps.current = (this.__steps.current + 1) % this.__steps.data.length;
        return step;
    },

    executeStep: function(step,time){
        if(step.step_type !== STEP_TYPE_SILENCE){
            this.__tonejs.sampler.triggerAttackRelease(step.sample.note_reference,0.2,time);
        }
        this.logMessage(step);
    },

    isFirstStep(){
        return (this.__steps.current == 0);
    },

    clearStepsData: function(){
        this.__steps.data = [];
    },

    addStepData: function(step){
        this.__steps.data.push(step);
    },


    stop: function(){
        this.__is_playing = false;
        this.__steps.current = 0;

        Tone.Transport.stop();
        this.logMessage('Kun Leguero detenido (#stop)');
    },


    start(){
        if(this.hasPlayed()){
            Tone.Transport.bpm.rampTo(kun_instance.speed,1);
        }
        else{
            Tone.Transport.bpm.value = this.speed;
            this.setHasPlayed(true);
        }
        Tone.Transport.start();
        this.setPlaying(true);
        this.logMessage('Kun Leguero reproduciendo (#start)');
    },

    isPlaying(){
        return this.__is_playing;
    },
    
    setPlaying(value){
        this.__is_playing = value;
    },

    hasPlayed(){
        return this.__has_played;
    },

    setHasPlayed(value){
        this.__has_played = value;
    },

    initialize: function(){
        this.__tonejs.sampler = new Tone.Sampler({
            urls: {
                "C4": "aro_sin_acento.ogg",
                "D4": "aro_con_acento.ogg",
                "E4": "parche_sin_acento.ogg",
                "F4": "parche_con_acento.ogg",
            },
            baseUrl: PATH_SAMPLES,
            }).toDestination();

            Tone.loaded().then(() => {

                // start/stop the oscillator every quarter note
                Tone.Transport.scheduleRepeat(time => {
                    playStep(time);
                }, kun_instance.time_signature.musical_note.note_english);

                kun_instance.logMessage('Inicializado sampler de ToneJS');
            });
            kun_instance.logMessage('El Kun ha sido inicializado!.');
    },

    logMessage(object){
        if(this.development.debug){
            console.log(object);
        }
    }

}

const pattern_textarea  = document.getElementById('pattern');
const start_button      = document.getElementById('start_button');
const configuration_selector = document.getElementById('configuration');
const step_highlight_checkbox = document.getElementById('step_highlight')


function stop(){
    start_button.textContent= "Comenzar";
    kun_instance.stop();
}

function startStop() {
  if (kun_instance.isPlaying()) {
    stop();
  } else {
    start_button.textContent= (kun_instance.isFirstStep() ? "Detener" : "Comenzar");
    render();
    processPatternToStepsData();

    kun_instance.start();
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
    kun_instance.clearStepsData();
    let m;

    while ((m = PROCESS_PATTERN_REGEX.exec(pattern_textarea.value)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === PROCESS_PATTERN_REGEX.lastIndex) {
            PROCESS_PATTERN_REGEX.lastIndex++;
        }
        let new_step = {...STEP_CONFIGURATION[m]};  // Clonado
        new_step.position = m.index;

        kun_instance.addStepData(new_step);
    }
    kun_instance.logMessage(kun_instance.__steps);
}

function playStep(time) {
    let step = kun_instance.getNextStep();
    if(kun_instance.config.step.highlight){
        selectStepInTextArea(step);
    }

    kun_instance.executeStep(step,time);
}

function render(){
    //Solo si el compás requiere renderizado...
    if(kun_instance.time_signature.group.render_required){
        let max_items =  kun_instance.time_signature.group.max_items;
        let with_separator =  kun_instance.time_signature.group.separator ? ' ':'';
        let new_pattern_array = [];
        //Se deben quitar todo tipo de espacios en blanco
        let pattern_without_spaces = kun_instance.pattern.replace(/ /g, '');

        for($i=0; $i<pattern_without_spaces.length; $i+=(max_items)){
            new_pattern_array.push(pattern_without_spaces.substr($i,max_items));
        }

        pattern_textarea.value = new_pattern_array.join(with_separator);
    }
}

function processPattern(pattern_value,with_render){
    kun_instance.pattern = pattern_value.replace(/[^AaPp_ \-]/g, ''); // Solo permite A, P, Espacio en blanco, "-" y "_"
    if(with_render){render()};
}

/// EVENTOS
document.getElementById('speed').addEventListener('input', function () {
  kun_instance.speed = parseInt(this.value);
  if (kun_instance.isPlaying()) {
    Tone.Transport.bpm.rampTo(kun_instance.speed,1);
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
        case '0020':    kun_instance.time_signature = TIME_SIGNATURE_NONE_2;
                        break;
        case '0040':    kun_instance.time_signature = TIME_SIGNATURE_NONE_4;
                        break;
        case '3420':    kun_instance.time_signature = TIME_SIGNATURE_3_4_2;
                        break;
        case '3440':    kun_instance.time_signature = TIME_SIGNATURE_3_4_4;
                        break;
        case '6820':    kun_instance.time_signature = TIME_SIGNATURE_6_8_2;
                        break;
        case '6840':    kun_instance.time_signature = TIME_SIGNATURE_6_8_4;
                        break;
        case '6821':    kun_instance.time_signature = TIME_SIGNATURE_6_8_2_BINARY;
                        break;
        case '6841':    kun_instance.time_signature = TIME_SIGNATURE_6_8_4_BINARY;
                        break;


        default:    //NO deberia darse...
    }

    pattern_textarea.cols = kun_instance.time_signature.text.cols;
    pattern_textarea.placeholder = kun_instance.time_signature.text.placeholder;

    processPattern(pattern_textarea.value,true)

});

step_highlight_checkbox.addEventListener('change',function () {
    kun_instance.config.step.highlight = this.checked;
});

window.addEventListener("load", (event) => {
    // Se toma el valor del patron
    processPattern(pattern_textarea.value, true);

    kun_instance.initialize();
    document.getElementById('version').innerHTML= kun_instance.development.version;
});

document.addEventListener("visibilitychange", () => {
    if(document.hidden){
        stop();
    }
});
