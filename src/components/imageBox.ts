import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {ref, createRef} from 'lit/directives/ref.js';

import Jimp from 'jimp/browser/lib/jimp';

@customElement('cat-box')
export class CatBox extends LitElement {
    static styles = css`
        .container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            background-color: #5f5f5f;
            margin: 0 auto;
            border-radius: 4px;
        }
        canvas {
            margin: 0 auto;
            background-color: #fff;
        }
    `;

    canvasRef = createRef<HTMLInputElement>();

    @property()
    height: Number = 500;

    @property()
    width: Number = 500;

    curImage: Uint8Array = new Uint8Array();
    rgbColor: Number[] = [0, 0, 0];

    async handleImageLoad(evt: any) {
        const self = this;
        const file = evt.target.files[0];
        const reader = new FileReader();
        reader.readAsBinaryString(file);

        reader.onload = function(event) {
            var image = new Image();
            image.src = `data:${file.type};base64,${btoa(event.target.result.toString())}`;
            image.onload = function () {
                //@ts-ignore
                self.height = this.height;
                //@ts-ignore
                self.width = this.width;

                Jimp.read(image.src, (err, entry) => {
                    if (err) throw err;
                    entry
                    //@ts-ignore
                      .quality(100) // set JPEG quality
                      .greyscale() // set greyscale
                    
                    let filteredArr = entry.bitmap.data.filter((value, index, Arr) => {
                        return index % 4 == 0;
                    });
                    self.curImage = filteredArr;
                    self.drawImage(filteredArr)
                });
            }
        };

        reader.onerror = function() {
            console.log("couldn't read the file");
        };
    }

    handleColor(evt: any) {
        var aRgbHex = evt.target.value.substring(1).match(/.{1,2}/g);
        var aRgb = [
            parseInt(aRgbHex[0], 16),
            parseInt(aRgbHex[1], 16),
            parseInt(aRgbHex[2], 16)
        ];
        this.rgbColor = aRgb;
        this.drawImage();
    }

    drawImage(imageArr?: Uint8Array) {
        const data = imageArr || this.curImage;
        
        if (this.canvasRef.value && data.length) {
            const canvas : any = this.canvasRef.value;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let curIndex = 0;
            
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const opac = data[curIndex];
                    
                    ctx.fillStyle = `rgba(${this.rgbColor[0]}, ${this.rgbColor[1]}, ${this.rgbColor[2]},${1 - opac / 255})`;
                    ctx.fillRect( x, y, 1, 1 );
                    curIndex++
                }            
            }
        }
    }


    render() {
        return html`
            <div class="container">
                <div>
                    <canvas ${ref(this.canvasRef)} height="${this.height}px" width="${this.width}px"></canvas>
                </div>
                <input @change="${this.handleImageLoad}" type="file" accept="image/png, image/jpeg">
                <input type="color" @change="${this.handleColor}" value="#000000">
            </div>
        `;
    }
}