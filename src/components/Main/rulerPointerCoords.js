class MouseCoord {
    constructor () {
        this.x = 0;
        this.y = 0;
    }

    _mouseMoveHandle = (e) => {
        this.x = e.offsetX;
        this.y = e.offsetY;
    }

    begin = () => {
        main.addEventListener('mousemove', _mouseMoveHandle);
    }

    end = () => {
        try {
            main.removeEventListener('mousemove', _mouseMoveHandle);
        } catch (ex) {}
    }
}

let mouseCoordinates = new MouseCoord();

export { mouseCoordinates }