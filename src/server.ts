import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (req:express.Request, res:express.Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );

  app.get("/filteredimage", async (req: express.Request, res: express.Response) => {
    try {
      const image_url: string = req.query.image_url as string
      if (validImageUrl(image_url)) {
        filterImageFromURL(image_url).then((absolutePath: string) => {
          res.status(200).sendFile(absolutePath, () => {
            try {
              const fileList: Array<string> = readAllFiles()
              deleteLocalFiles(fileList)
            } catch (err: any) {
              console.log(`[deleteLocalFiles] Unexpected error: ${err.message}`)
            }
          })
        })
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(400).send({
          errorType: 'Validate Error',
          errorMessage: err.message
        })
      } else {
        res.status(500).send({
          errorType: 'Unexpected Error',
          errorMessage: 'Something is wrong'
        })
      }
    }
  })

  /**
   * Check not null variable
   * Check extension variable
   *
   * @param {string} image_url
   * @return {*}  {boolean}
   */
  function validImageUrl(image_url: string): boolean {
    if (!image_url) {
      throw new Error('image_url is not null')
    }
    const USUALLY_IMAGE_EXTENSION_USED = [
      "png",
      "jpeg",
      "jpg",
      "bmp",
      "gif",
      "raw",
      "svg",
      "webp",
      "ico",
    ]
    const imageUrlSplit: Array<string> = image_url.split('.')
    const extension: string = imageUrlSplit[imageUrlSplit.length - 1]
    if (!USUALLY_IMAGE_EXTENSION_USED.includes(extension.toLowerCase())) {
      throw new Error('image_url is not image')
    }
    return true
  }

  /**
   * Get all files inside './util/tmp' folder
   *
   * @return {*}  {Array<string>}
   */
  function readAllFiles(): Array<string> {
    try {
      const path = require('path')
      const fs = require('fs')
      const { join } = require ('path')
      const imageFolder: string = path.resolve(__dirname, './util/tmp')
      const fileList: Array<string> = []
      fs.readdirSync(imageFolder).forEach((file: string) => {
        let fullPath = join(imageFolder, file)
        fileList.push(fullPath)
      })
      return fileList
    } catch (error: any) {
      console.log(`[readAllFiles] Unexpected error: ${error.message}`)
    }
  }

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();