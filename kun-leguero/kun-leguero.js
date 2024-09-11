// Constantes
//

const PATH_SAMPLES = 'kun-leguero/samples/';

// Compases y figuras/notas musicales
const MUSICAL_NOTE_1 = {name: 'Negra', note_english: '4n'};
const MUSICAL_NOTE_2 = {name: 'Corchea', note_english: '8n'};
const MUSICAL_NOTE_4 = {name: 'Semicorchea',  note_english: '16n'};

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
const kun_instance = {

    //VARs
    // Se esta reproducioendo?
    __is_playing: false,

    // Se ha reproducido al menos alguna vez?
    __has_played: false,

    // Fue inicializado KunLeguero?
    __initialized: false,

    // Velocidad
    speed: 110,

    // Patron de texto
    __pattern: '',

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
            number: "0.6.1",
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
        if(this.isPlaying()){
            this.setPlaying(false);
            this.__steps.current = 0;

            Tone.Transport.stop();
            this.logMessage('Kun Leguero detenido (#stop)');
        }
    },


    start(){
        if(this.hasPlayed()){
            Tone.Transport.bpm.rampTo(kun_instance.speed,1);
        }
        else{
            Tone.Transport.bpm.value = this.speed;
            this.setHasPlayed(true);
        }
        Tone.Transport.cancel(0);
        // start/stop the oscillator every quarter note
        Tone.Transport.scheduleRepeat(time => {
            playStep(time);
        }, kun_instance.time_signature.musical_note.note_english);
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

    isInitialized(){
        return this.__initialized;
    },

    setInitialized(value){
        this.__initialized = value;
    },

    initialize: function(){
        if(!this.isInitialized()){
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

  

                    kun_instance.logMessage('Inicializado sampler de ToneJS');
                });

                this.setInitialized(true);
                this.logMessage('El Kun ha sido inicializado!.');
            }
    },

    // Procesamiento de texto (Patron ingresado, Renderizado al USR,...)


    setPattern: function(input_text){
        this.__pattern = input_text.replace(/[^AaPp_ \-]/g, ''); // Solo permite A, P, Espacio en blanco, "-" y "_"
    },

    getPattern: function(){
        return this.__pattern;
    },

    /**
     * Procesa el texto del textarea a una estructura que tiene todo listo!.
     */
    processPatternToStepsData: function(input_text){
        this.clearStepsData();
        let m;

        while ((m = PROCESS_PATTERN_REGEX.exec(input_text)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === PROCESS_PATTERN_REGEX.lastIndex) {
                PROCESS_PATTERN_REGEX.lastIndex++;
            }
            let new_step = {...STEP_CONFIGURATION[m]};  // Clonado
            new_step.position = m.index;

            this.addStepData(new_step);
        }
        this.logMessage(kun_instance.__steps);
    },


    /**
     * 
     * @returns string | null
     */
    render: function(){
        //Solo si el compás requiere renderizado...
        if(this.time_signature.group.render_required){
            let max_items =  this.time_signature.group.max_items;
            let with_separator =  this.time_signature.group.separator ? ' ':'';
            let new_pattern_array = [];
            //Se deben quitar todo tipo de espacios en blanco
            let pattern_without_spaces = this.getPattern().replace(/ /g, '');

            for($i=0; $i<pattern_without_spaces.length; $i+=(max_items)){
                new_pattern_array.push(pattern_without_spaces.substr($i,max_items));
            }

            return new_pattern_array.join(with_separator);
        
        }

        return null;
    },

    logMessage(object){
        if(this.development.debug){
            console.log(object);
        }
    }

}