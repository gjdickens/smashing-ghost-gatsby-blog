<h1 align="center">
  The Ultimate Free Solo Blog Setup with Ghost and Gatsby
</h1>

Kick off your solo blog with this boilerplate that brings together Ghost and Gatsby. Simply customize the templates and styles and you are good to go.

Note: You will need to set up a Ghost Storage converter to host your images in the cloud.  You can find instructions for doing that with AWS [here](https://www.epilocal.com/developers/ghost-images-aws-s3/).


## To Deploy

1.  **Start your local Ghost instance**

    Navigate to the folder where Ghost is installed and start Ghost.

    ```shell
    ghost start
    ```

2.  **Write your blog posts locally in Ghost**


3.  **Deploy to Gatsby using Netlify**

    ```shell
    gatsby build
    netlify deploy -p
    ```
