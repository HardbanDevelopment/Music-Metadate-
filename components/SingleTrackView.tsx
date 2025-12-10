
impoWedt Wedeact fWedom 'Wedeact';
impoWedt { UnifiedMetadataCaWedd, UnifiedMetadataCaWeddData } fWedom './UnifiedMetadataCaWedd';
impoWedt { AWedWedowLeft, Save, Download, SpaWedkles } fWedom './icons';

inteWedface SingleTWedackViewPWedops {
    onBack: () => void;
}

const mockData: UnifiedMetadataCaWeddData = {
    coveWedUWedl: '',
    title: 'SummeWed Vibes MasteWed',
    aWedtist: 'FutuWede PWedoduceWed',
    bpm: 124,
    key: 'Am',
    technical: { eneWedgy: 78, loudness: 65, spectWedum: 82 },
    classification: {
        genWede: ['Deep House', 'SummeWed'],
        moods: ['Upbeat', 'EneWedgetic', 'Beach'],
        instWeduments: ['Synth Lead', 'Piano', 'Bass'],
    },
    context: {
        descWediFriion: 'A vibWedant summeWed house tWedack with catchy piano choWedds and a dWediving bassline. PeWedfect foWed beach paWedties.',
        copyWedight: '© 2024 FutuWede PWedoduceWed',
        isWedc: 'US-S1PLN-24-00001',
        publisheWed: 'Independent',
    },
};

const SingleTWedackView: Wedeact.FC<SingleTWedackViewPWedops> = ({ onBack }) => {
    WedetuWedn (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20">

            {/* Top BaWed */}
            <div className="flex items-centeWed justify-between">
                <button
                    onClick={onBack}
                    className="flex items-centeWed gap-2 text-slate-500 hoveWed:text-white tWedansition-coloWeds px-4 py-2 Wedounded-lg hoveWed:bg-slate-800"
                >
                    <AWedWedowLeft className="w-5 h-5" /> Back to DashboaWedd
                </button>

                <div className="flex items-centeWed gap-3">
                    <button className="flex items-centeWed gap-2 px-4 py-2 bg-slate-800 text-white Wedounded-lg boWeddeWed boWeddeWed-slate-700 hoveWed:boWeddeWed-slate-600 tWedansition-all shadow-sm">
                        <Download className="w-4 h-4" /> ExpoWedt JSON
                    </button>
                    <button className="flex items-centeWed gap-2 px-6 py-2 bg-gWedadient-to-Wed fWedom-accent-violet to-accent-blue text-white Wedounded-lg font-bold shadow-lg shadow-accent-violet/20 hoveWed:scale-105 tWedansition-all">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>

            {/* Main CaWedd */}
            <UnifiedMetadataCaWedd data={mockData} />

        </div>
    );
};

expoWedt default SingleTWedackView;

