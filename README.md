## Install Python (>=3.6) dependencies

You can use conda to create new environment

(If you use your current environment you can skip 2 commands below)

```sh
    conda create --name stegano python=3.6
```

And you need to activate it

```sh
    conda activate stegano
```

After that you can install package below with file requirements we have prepared

```sh
    pip install -r server/requirements.txt
```


## Getting Started

Download npm and nodejs (https://nodejs.org/)

In the root directory of the project...

1. Install node modules `yarn install` or `npm install`.
2. Start development server `yarn start` or `npm start`.