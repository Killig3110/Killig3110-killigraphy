import { useCallback, useState } from 'react' // Importing React and useCallback from React
import { FileWithPath, useDropzone } from 'react-dropzone' // Importing useDropzone from react-dropzone
import { Button } from '../ui/button'
// React-dropzone is a library for creating file upload components with drag-and-drop functionality.

type FileUploaderProps = {
    fieldChange: (files: File[]) => void;
    mediaUrl?: string;
}

const FileUpLoader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
    const [, setFile] = useState<File[]>([])
    const [fileUrl, setFileUrl] = useState(mediaUrl || ''); // State to store the URL of the uploaded file.
    // useState is a React hook that allows you to add state to functional components.

    // useDropzone is a hook that provides the functionality for drag-and-drop file uploads.
    // It takes an object with options and a callback function to handle file drops.
    const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        setFile(acceptedFiles) // Sets the accepted files to the state.
        fieldChange(acceptedFiles) // Calls the fieldChange function with the accepted files.
        setFileUrl(URL.createObjectURL(acceptedFiles[0])) // Creates a URL for the first accepted file and sets it to the state.
    }, [fieldChange]) // useCallback memoizes the function to prevent unnecessary re-renders.
    // The dependency array [file] ensures that the function is recreated only when the file state changes.

    const { getRootProps, // This function returns the props needed to create the dropzone area.
        getInputProps,  // This function returns the props needed for the input element that handles file selection.
    } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.svg'], // Accepts image files with the specified extensions.
        },
    })

    const displayUrl = fileUrl || mediaUrl;

    return (
        <div {...getRootProps()} className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer">
            <input {...getInputProps()}
                className='cursor-pointer'
            /> {
                displayUrl ? (
                    <>
                        <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
                            <div className="relative max-h-[600px] overflow-auto rounded-xl">
                                <img
                                    src={displayUrl}
                                    alt="uploaded-file"
                                    className="w-auto h-auto max-h-[600px] object-contain"
                                />
                            </div>
                        </div>
                        <p className="file_uploader-label">
                            Click or drag photos to replace the image
                        </p>
                    </>
                ) : (
                    <div className='file_uploader-box'>
                        <img
                            src='/assets/icons/file-upload.svg'
                            alt='file-upload'
                            className="w-24 h-24"
                        />

                        <h3 className="base-medium text-light-2 mb-2 mt-6">
                            Drag & Drop your photos here
                        </h3>
                        <p className="text-light-4 small-regular mb-6">
                            SVG, PNG, JPG
                        </p>

                        <Button className='shad-button_dark_4'>
                            Select from device
                        </Button>
                    </div>
                )
            }
        </div>
    )
}

export default FileUpLoader