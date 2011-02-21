/*
 * heatmap.js - a JavaScript heatmap implementation using <canvas>
 *
 * Andy Isaacson <adi@hexapodia.org>
 * Copyright 2011 - All Rights Reserved
 *
 * This program is free software, licensed under the GNU GPL version 3.0.
 */

function dbg(msg) {
    var d = document.getElementById("debug");
    d.textContent += msg + "\n";
}

function grid(ctx, x, y, w, h, n, m, v) {
    var i, j;

    // outline (temporary)
    ctx.strokeStyle = "#0f0";
    ctx.strokeRect(x-.5, y-.5, w+1, h+1)

    for (i=0; i<n; i++) {
        for (j=0; j<m; j++) {
            var a = Math.floor(v[i][j] * 255);
            var rgb = "rgb("+a+","+a+","+a+")";
            ctx.fillStyle = rgb;
            ctx.fillRect(x+(i * w) / n, y+(j * h) / m, w / n, h / m);
        }
    }
}

/*
 * Draw a heatmap on canvas ctx at rectangle (x, y, w, h).  L: list of tuples
 * of samples { time, val }.
 * nbucket: number of vertical intervals to bucket samples into.
 * ninter: number of horizontal intervals to separate heatmap into.
 * min, max: optional limits of Y axis.
 * start, end: optional limits of X axis.
 */
function heatmap(ctx, x, y, w, h, L, ninter, nbucket, min, max, start, end) {
    var i, j;
    var a = new Array(ninter);

    for (i=0; i<ninter; i++) {
        a[i] = new Array(nbucket);
        for (j=0; j<nbucket; j++)
            a[i][j] = 0;
    }

    dbg("L.length: " + L.length);
    if (start == -1 || end == -1 || min == -1 || max == -1) {
        var xmin = Infinity, xmax = -Infinity;
        var ymin = Infinity, ymax = -Infinity;
        for (i=0; i<L.length; i++) {
            var x = L[i][0], y = L[i][1];
            if (x < xmin) xmin = x;
            if (x > xmax) xmax = x;
            if (y < ymin) ymin = y;
            if (y > ymax) ymax = y;
        }
        if (start == -1) start = xmin;
        if (end == -1) end = xmax;
        if (min == -1) min = ymin;
        if (max == -1) max = ymax;
    }
    dbg("start: " + start + " end: " + end + " min: " + min + " max: " + max);

    var amax = -Infinity;
    for (i=0; i<L.length; i++) {
        var x = L[i][0], y = L[i][1];
        var column = Math.floor((x - start) / (end - start) * ninter);
        var bucket = Math.floor((y - min) / (max - min) * nbucket);
        if (column >= 0 && column < ninter && bucket >= 0 && bucket < nbucket) {
            var v = a[column][bucket] + 1;
            dbg("x[" + column + "," + bucket + "] = " + v + " ");
            a[column][bucket] = v;
            if (v > amax) amax = v;
        }
    }
    dbg("amax: " + amax);
    for (i=0; i<ninter; i++) {
        for (j=0; j<nbucket; j++) {
            a[i][j] = 1.0 - (a[i][j] * 1.0 / amax);
        }
    }

    grid(ctx, x, y, w, h, ninter, nbucket, a);
}
