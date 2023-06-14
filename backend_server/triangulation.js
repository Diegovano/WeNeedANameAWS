function calculate() {

    // get input data
    EA=document.form1.EA.value; // EB
    EB=document.form1.EB.value; // ER
    EC=document.form1.EC.value; // EY
    NA=document.form1.NA.value; // NB
    NB=document.form1.NB.value; // NR 
    NC=document.form1.NC.value; // NY
    ALPHA = document.form1.ANG_ALPHA.value; // alpha 
    GAMMA = document.form1.ANG_GAMMA.value; // gamma
    ANG_ALPHA=ALPHA * Math.PI / 180;
    ANG_GAMMA=GAMMA * Math.PI / 180;
 
    // calculate ANG_BETA
    ANG_BETA=2*Math.PI - ANG_ALPHA - ANG_GAMMA;
 
    // calculate distances
    AB=Math.sqrt( Math.pow((EA-EB),2) + Math.pow((NA-NB),2) );
    AC=Math.sqrt( Math.pow((EA-EC),2) + Math.pow((NA-NC),2) );
    BC=Math.sqrt( Math.pow((EB-EC),2) + Math.pow((NB-NC),2) );
 
    // calculate angles
    ANG_A = Math.acos( (Math.pow(AB, 2) + Math.pow(AC,2) - Math.pow(BC,2))/(2*AB*AC) );
    ANG_B = Math.acos( (Math.pow(AB, 2) + Math.pow(BC,2) - Math.pow(AC,2))/(2*AB*BC) );
    ANG_C = Math.acos( (Math.pow(AC, 2) + Math.pow(BC,2) - Math.pow(AB,2))/(2*AC*BC) );
 
    // calculate cotangents of angles
    COT_A = 1/Math.tan(ANG_A);
    COT_B = 1/Math.tan(ANG_B);
    COT_C = 1/Math.tan(ANG_C);
    COT_ALPHA = 1/Math.tan(ANG_ALPHA);
    COT_BETA = 1/Math.tan(ANG_BETA);
    COT_GAMMA = 1/Math.tan(ANG_GAMMA);
 
    // calculate scalers
    KA = 1/(COT_A - COT_ALPHA);
    KB = 1/(COT_B - COT_BETA);
    KC = 1/(COT_C - COT_GAMMA);
    K  = KA + KB + KC;
 
    // calculate final coordinates
    E = (KA*EA + KB*EB + KC*EC)/K;
    N = (KA*NA + KB*NB + KC*NC)/K;
 
    // calculate distances from point P
    AP=Math.sqrt( Math.pow((EA-E),2) + Math.pow((NA-N),2) );
    BP=Math.sqrt( Math.pow((EB-E),2) + Math.pow((NB-N),2) );
    CP=Math.sqrt( Math.pow((EC-E),2) + Math.pow((NC-N),2) );
 
    // calculate angles in degrees
    BAC = ANG_A * 180 / Math.PI
    ABC = ANG_B * 180 / Math.PI
    ACB = ANG_C * 180 / Math.PI
 
    // display final coordinates
    document.form1.E.value = E;
    document.form1.N.value = N;
 
    // display other results of interest
    document.form1.AB.value = AB;
    document.form1.BC.value = BC;
    document.form1.AC.value = AC;
    document.form1.AP.value = AP;
    document.form1.BP.value = BP;
    document.form1.CP.value = CP;
    document.form1.ANG_BAC.value = BAC;
    document.form1.ANG_ABC.value = ABC;
    document.form1.ANG_ACB.value = ACB
 
    report();
 }