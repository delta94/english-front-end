import React from "react";
import ImageUploader from "react-images-upload";
import { Spinner } from "reactstrap";
import config from "../../../../config";
import { MediaType } from "../../../../schema/schema";
import "./index.css";
interface ImageUploadProps {
  url?: string;
  singleImage?: boolean;
  setPath?: (val: string) => void;
  type: MediaType;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  type,
  url,
  singleImage,
  setPath,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [pathPreview, setPathPreview] = React.useState("");
  React.useEffect(() => {
    url && setPathPreview(url);
  }, [url]);
  const handleImageChange = async (e: any, p: any) => {
    const data = new FormData();
    data.append("file", e[0]);
    data.append("name", e[0].name);
    data.append("type", e[0].type);
    data.append("typeFolder", type.toLowerCase());
    setLoading(true);

    await fetch(config.UPLOAD_MEDIA + "media", {
      method: "POST",
      body: data,
      credentials: 'same-origin',
      headers: {
        Accept: "application/json",
      },
    }).then((response) =>
      response.json().then((res) => {
        if (res.success) {
          setLoading(false);
          setPath && setPath(res.data.path);
          setPathPreview(config.PATH_IMAGE + res.data.path);
        }
      })
    );
  };

  return (
    <div className="w-100 text-center wrapper-input-image">
      <ImageUploader
        className="w-100 ml-auto"
        withIcon={false}
        buttonText="Choose images"
        onChange={(e, p) => {
          handleImageChange(e, p);
        }}
        imgExtension={[".jpg", ".gif", ".png", ".gif"]}
        maxFileSize={5242880}
        singleImage={singleImage}
      />
      {loading && <Spinner color="primary" />}
      {!loading && pathPreview !== config.PATH_IMAGE && (
        <div className="position-relative wrapper-img">
          <img className="img" src={pathPreview} alt="" />
          <span
            className="position-absolute"
            onClick={() => {
              setPathPreview("");
              setPath && setPath("");
            }}
          >
            X
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
