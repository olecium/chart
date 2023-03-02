import React from "react";
import { useCSVReader } from "react-papaparse";
import { IData } from "../../interfaces/interfaces";
import CSVReaderComponent from './CSVReaderComponent';

interface IUploader {
    handleData: (data: IData) => void;
}

const Uploader = (props: IUploader): JSX.Element => {

    const [nodes, setNodes] = React.useState<any>(undefined);
    const [matrix, setMatrix] = React.useState<any>(undefined);

    const { CSVReader } = useCSVReader();

    const uploadNodesHandler = (results: any) => {
        setNodes(results.data);
    }

    const uploadMatrixHandler = (results: any) => {
        setMatrix(results.data);
    }

    const submitData = () => {
        props.handleData({ nodes: nodes, matrix: matrix });
    }

    return (
        <>
            <div className="uploader">
                <CSVReader
                    onUploadAccepted={uploadNodesHandler}
                >{({
                    getRootProps,
                    acceptedFile,
                    ProgressBar,
                    getRemoveFileProps,
                }: any) => (
                    <CSVReaderComponent
                        getRootProps={getRootProps}
                        acceptedFile={acceptedFile}
                        ProgressBar={ProgressBar}
                        getRemoveFileProps={getRemoveFileProps}
                        label={'Choose Nodes file'}
                    />
                )}
                </CSVReader>

                <CSVReader
                    onUploadAccepted={uploadMatrixHandler}
                >
                    {({
                        getRootProps,
                        acceptedFile,
                        ProgressBar,
                        getRemoveFileProps,
                    }: any) => (
                        <CSVReaderComponent
                            getRootProps={getRootProps}
                            acceptedFile={acceptedFile}
                            ProgressBar={ProgressBar}
                            getRemoveFileProps={getRemoveFileProps}
                            label={'Choose Matrix file'}
                        />
                    )}
                </CSVReader>

                <button className="submit" onClick={submitData}>Submit</button>
            </div>
        </>
    );
}

export default Uploader;