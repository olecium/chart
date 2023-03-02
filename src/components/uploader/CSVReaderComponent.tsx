import { CSSProperties } from "react";

const styles = {
    csvReader: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 10,
    } as CSSProperties,
    fileLabel: {
        marginBottom: '5px',
        marginTop: '10px',
        display: 'block'
    } as CSSProperties,
    browseFile: {
        width: '150px',
        backgroundColor: '#46a3bc',
        border: '0 none',
        borderTopLeftRadius: '10px',
        borderBottomLeftRadius: '10px',
        color: '#fff',
        padding: '0 20px'
    } as CSSProperties,
    acceptedFile: {
        border: '1px solid #ccc',
        height: 45,
        lineHeight: 2.5,
        paddingLeft: 10,
        width: '80%',
    } as CSSProperties,
    remove: {
        border: '0 none',
        backgroundColor: '#46a3bc',
        borderTopRightRadius: '10px',
        borderBottomRightRadius: '10px',
        color: '#fff',
        padding: '0 20px'
    } as CSSProperties,
    progressBarBackgroundColor: {
        backgroundColor: '#39a36c',
        marginBottom: '10px'
    } as CSSProperties,
};

const CSVReaderComponent = ({
    getRootProps,
    acceptedFile,
    ProgressBar,
    getRemoveFileProps,
    label
}: any): JSX.Element => {
    return (
        <div>
            <label style={styles.fileLabel}>{label}</label>
            <div style={styles.csvReader}>
                <button type='button' {...getRootProps()} style={styles.browseFile}>
                    Browse file
                </button>
                <div style={styles.acceptedFile}>
                    {acceptedFile && acceptedFile.name}
                </div>
                <button {...getRemoveFileProps()} style={styles.remove}>
                    Remove
                </button>
            </div>
            <ProgressBar style={styles.progressBarBackgroundColor} />
        </div>
    );
}

export default CSVReaderComponent;