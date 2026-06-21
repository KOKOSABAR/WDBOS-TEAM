const fs = require('fs');

const rawData = `SAMUEL BOANARGES	**VVIP**	LEADER	samuelboan.smb88@gmail.com			KERJA		LAKI-LAKI		V I P		VIP								14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
FADLAN PRATAMA TAMBUNAN	C6814592	CS	wdbosfadlanpratama@gmail.com	wdbosfadlanpratama@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		SINGKAWANG		FADLAN		SEASON 2		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
EVRI SIHITE	C7919675	CS	evrisihite975@gmail.com	evrisihite975@gmail.com		DIRUMAHKAN		PEREMPUAN				VIP		SIDIKALANG		EVRISIHITE		SEASON 3		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
DWI ARIYANTO	X7836795	CS	dwiariyanto9956@gmail.com			DIRUMAHKAN		LAKI-LAKI				VIP						-		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ZIKRI TRIANSYAH KAMAL	E7722009	CS	zikritriansyahkamal251@gmail.com	zikritriansyahkamal251@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN				SEASON 2		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
NICO FEBRIAN	E3163410	CS	nicofebrian120623@gmail.com	nicofebrian120623@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		PONTIANAK		Nico		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
GILBERTO ANGELINO	C9252203	CS	gilbertoangelino117@gmail.com	gilbertoangelino117@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		JAKARTA		Gilbert		SEASON 3		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
HENGKI	E2612730	CS	hengkikeker17@gmail.com	hengkikeker17@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		TEBAS		HENGKI		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
TAUFAN KHATULISTIWA	E2406129	CS	taufankhatulistiwa821@gmail.com	taufankhatulistiwa821@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		SURABAYA		Taufankhatulistiwa		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ERIC SYAHPUTRA	E5525035	CS	ericsyahputra051223@gmail.com	ericsyahputra051223@gmail.com		CUTI		LAKI-LAKI		MESS 52		VIP		LUBUK PAKAM		Eric.S		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
SAZU SAHPUTRA	C8490663	CS	sazusahputra546@gmail.com	sazusahputra546@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		BINJAI		sazusahputra		SEASON 3		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
DIVA DAWWAS	X9302197	CS	divadwas.smb88@gmail.com	divadwas.smb88@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		BINJAI		dievadawwas'		SEASON 3		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MUHAMMAD RIO AFRIZA	C7776080	CS	rioafriza5412@gmail.com	rioafriza5412@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		medan		m rio		SEASON 2		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ADITYA PANCA NUGRAHA	E2929201	CS	adityapanca3103@gmail.com	adityapanca3103@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN				-		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
SURAJ KUMAR	E1714955	CS	surajkumaraja1945@gmail.com	surajkumaraja19451@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP				SURAJ		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
JOESQUENSEND GAVEROND	X2837768	CS	jgaverond@gmail.com	jgaverond@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		PANGKAL PINANG				SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ANDRE EVANDRO GINTING	E3524180	CS	evandroandre888@gmail.com	andre030524@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN				SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
VERRI AYANG	E2929082	CS	verriayang88.smb88@gmail.com	verriayangbk88@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN PANTAI LABU		verriayang		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MUHAMMAD ANDRI AZMI	E2867309	CS	azmimuhammadandri@gmail.com	azmimuhammadandri@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		KLAMBIR 5 MEDAN		muhammad andri azmi		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
FENNY PURWANDARI	E2375173	CS	fennypurwandari122@gmail.com	fennypurwandari122@gmail.com		DIRUMAHKAN		PEREMPUAN				VIP		MEDAN MARELAN		FENNY WANDARI		SEASON 4		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
RENATAN	E5152033	CS	renatan131223@gmail.com	renatan131223@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		PONTIANAK		RENATAN		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
LEO JONATHAN LIM	C9041353	CS	LEOJONATHAN15082024@gmail.com	LEOJONATHAN15082024@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		BINJAI				SEASON 7		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
NICO ADRIANSYAH HUTAGAOL	X6653631	CS	nicoadriansyahh@gmail.com	nicoadriansyahh@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		BINJAI				SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ARJUN	E2214449	CS	arjunaja1945@gmail.com			KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN		ARJUN		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
DIVA SAPUTRA	X7906822	CS	divasaputraaa88@gmail.com	divasaputraaa88@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		MEDAN		DIVA SAPUTRA		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
RONNY	X2658487	CS	ronny270424@gmail.com	ronny270424@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		Pontianak		Ronny		SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
HARIS RIZALDY ARUAN	E4098434	CS	harisrizaldyaruan@gmail.com	harisrizaldyaruan@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		Tanjung morawa		Teguh Andrean		SEASON 7		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
AFIF RAIS	E3504038	CS	afifrais33@gmail.com	afifrais33@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN		HARIS RIZALDY ARUAN		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MUHAMMAD AUDI SOFIAN	X7905920	CS	audisofian1945@gmail.com			DIRUMAHKAN		LAKI-LAKI				ROOM 7 VIP		MEDAN		Rais		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MUHAMMAD FACHRI	E7092105	CS	muhammadfachri15082024@gmail.com			KERJA		LAKI-LAKI		MESS 52		VIP						-		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
S G KEVINDRA NAIDU	E3503037	CS	Kevindranaidu55@gmail.com	kevindranaidu55@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP						-		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MORIS BILIEVE GINTING	E5801583	CS	morisginting120224@gmail.com			KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN		CHULBUL		SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
DIAZ HERMAWAN	X2726247	CS	diazhermawan93@gmail.com	diazhermawan93@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP						-		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
NURIL ABSHAR	E5380748	CS	nurilabshar.smb88@gmail.com	nurilabshar.smb88@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		RIAU		DIAZ		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ADITYA RIWANA	E0913677	CS	adityariwana250326@gmail.com	adityariwana250326@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		ACEH		NURIIL94		-		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
FERI ADYANTO	E5862182	CS	feriadyanto2@gmail.com	feriadyanto2@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		PONTIANAK				-		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
RINITA SOFIAN	E0536455	CS	rinita.smb88@gmail.com	rinita.smb88@gmail.com		KERJA		PEREMPUAN		MESS 85		VIP		Padang				SEASON 1		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MAHESTA RAZ	E1757678	KAPTEN KASIR	mahestaraz1532@gmail.com	mahestaraz1532@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN		mahesta		SEASON 2		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ANDRE BAYU WARDANA	C8255340	KAPTEN KASIR	andrebayuwar5465@gmail.com	andrebayuwar5465@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		BERINGIN		ANDRE BAYU		SEASON 2		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
JUAN ANDRE PANJAITAN	E2366520	KAPTEN KASIR	juanandrepanjaitan@gmail.com	juanandrepanjaitan@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		SIANTAR				SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
TERANGTA SEMBIRING	E6754459	KAPTEN KASIR	terangtasembiring17@gmail.com	terangtasembiring17@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		BERASTAGI		TERANGTA SEMBIRING		SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
FAISAL SABARYANTO	E2818631	KAPTEN KASIR	faisalsabaryanto44@gmail.com	faisalsabaryanto44@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		PONTIANAK		FAISAL SABARYANTO		SEASON 6		03/03/1996	NOT TODAY	30 TAHUN 3 BULAN		14/06/2026	0 TAHUN 0 BULAN
YOGI PERLIAN SYAHPUTRA	E4159055	KAPTEN KASIR	perliansyahputrayogi@gmail.com	perliansyahputrayogi8@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN MABAR		Yogiperlian		SEASON 5		16/02/2002	NOT TODAY	24 TAHUN 4 BULAN		14/06/2026	0 TAHUN 0 BULAN
MOHD REZA PAHLEVI	E7467387	KASIR	rezapahlevi.smb888@gmail.com	rezapahlevismb888@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		LANGSA		a1a2a3		SEASON 1		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
PRIYYA SONALY	E1986789	KASIR	priyasonaly888@gmail.com	priyasonaly888@gmail.com		DIRUMAHKAN		PEREMPUAN				VIP		MEDAN		PRIYYA		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
JAMENDRA PERANGIN ANGIN	E2864468	KASIR	jamendraperanginangin54@gmail.com	jamendrabk@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN		JAMENDRA		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MUHAMMAD FAHRI KURNIAWAN	C8489725	KASIR	fahrikurniawanm29@gmail.com	fahrikurniawanm291@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN		MUHAMMAD FAHRI KURNIAWAN		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MUHAMMAD FAHRI	E1475020	KASIR	muhammadfahri26845@gmail.com	muhammadfahri061023@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		BINJAI		FAHRI		SEASON 2		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MUH MARWIANTO	C8479150	KASIR	MUHMARWIMERDEKA@gmail.com	MUHMARWIMERDEKA@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		NTB		MUH MARWIANTO		SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
SITI WAHYUNINGSIH	E1509185	KASIR	siti310324@gmail.com	siti310324@gmail.com		DIRUMAHKAN		PEREMPUAN				VIP		BATAM		WAHYUNINGSIH SITI		SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
TANIA WIRANTI	E6253452	KASIR	TANIAWIRANTI09042024@gmail.com	TANIAWIRANTI09042024@gmail.com		KERJA		PEREMPUAN		MESS 85		VIP		MEDAN		TANIA WIRANTI		SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MUHAMMAD GHAZALI	C8543472	KASIR	muhammadghazali1523@gmail.com			DIRUMAHKAN		LAKI-LAKI				VIP		TELUK DALAM		Muhammad ghazali		SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
IQBAL ILHAM PRATAMA TAMBOKAN	E7179734	KASIR	ipratamatambokan@gmail.com			DIRUMAHKAN		LAKI-LAKI				VIP		STABAT		IQBAL ILHAM PRATAMA TAMBOKAN		SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
WINDA AGUSTIA	E7647231	KASIR	windaagustia247@gmail.com	windaagustia247@gmail.com		KERJA		PEREMPUAN		MESS 85		VIP		MEDAN		WINDAGST		SEASON 7		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
DONI SAPUTRA NAHAMPUN	E7694440	KASIR	donisaputranahampun93@gmail.com	donisaputranahampun93@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		BASRA				SEASON 7		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
CINDY SAPUTRI	X7900967	KASIR	cindysaputri7540@gmail.com	cindysaputri754@gmail.com		KERJA		PEREMPUAN		MESS 85		VIP		LUBUK PAKAM		CINDYSAPUTRI		SEASON 2		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
SADINA NST	E7530733	KASIR	sadinanst5@gmail.com	sadinanst5@gmail.com		KERJA		PEREMPUAN		MESS 85		VIP		MEDAN				SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MUHLIS	E5049051	KASIR	muhlisaja1112@gmail.com	muhlisaja1112@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		Pantai Labu		Muhlis		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
SAHARUDDIN	X3673527	KASIR	saharuddin2025@gmail.com			KERJA		LAKI-LAKI		MESS 52		VIP		TANJUNGPINANG		SAHARUDDIN		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ENDY LIE	E8451705	KASIR	endylie010125@gmail.com	endylie010125@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN				SEASON 7		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MUHAMMAD AZRI	E8726881	KASIR	muhammadazri010125@gmail.com			KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN		MUHAMMAD AZRI		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MOYNITA CHRISMA SEMBIRING	E0621159	KASIR	moynitachrismasembiring@gmail.com	moynitachrismasembiring@gmail.com		KERJA		PEREMPUAN		MESS 85		VIP		MEDAN		MOY		SEASON 7		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
PRITA GUSTINI	X4723273	KASIR	pritagustini010125@gmail.com	pritagustini010125@gmail.com		DIRUMAHKAN		PEREMPUAN				VIP		BOGOR		PRITA GUSTINI		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ADINDA RAPMAYANI MANURUNG	E8157935	KASIR	adindarapmayani888@gmail.com			DIRUMAHKAN		PEREMPUAN				VIP		MEDAN		ADINDA MANURUNG		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ANDREY SHEVA TARIGAN	E6037665	KASIR	andreysheva070325@gmail.com	andreysheva070325@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		BINJAI		ANDREYSHVTARIGAN		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
AKBAR REYNALDI MANIK	X3353629	KASIR	akbarreynaldi070325@gmail.com	akbarreynaldi070325@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		PERBAUNGAN		AKBAR REYNALDI MANIK		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
IMELDA LESTARI	X4809279	KASIR	imeldalestari070325@gmail.com	imeldalestari070325@gmail.com		KERJA		PEREMPUAN		MESS 85		VIP		STABAT		IMELDA		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
SUTIENO	X2655440	KASIR	sutienobold@gmail.com	sutienobold@gmail.com		DIRUMAHKAN		LAKI-LAKI				VIP		PONTIANAK		SUTIENO		SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
TEDY	C7615156	KASIR	tedynamthip@gmail.com	tedynamthip@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN		TEDY		SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
YOLANDA LUBIS	E7088470	KASIR	yolandalubisbold88@gmail.com	yolandalubisbold88@gmail.com		KERJA		PEREMPUAN		MESS 85		VIP		SIANTAR				SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MELANI	E4723253	KASIR	melani240324@gmail.com	melani240324@gmail.com		KERJA		PEREMPUAN		MESS 85		VIP		MEDAN		MELANI		SEASON 6		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ANTONI	C9740702	KASIR	antoni9992227@gmail.com	antoni9992227@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		TanjungPinang				SEASON 7		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
L MANISA	X1317828	KASIR	Lmanisa817@gmail.com			DIRUMAHKAN		PEREMPUAN				VIP								14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ADE SAEPUDIN	E5582962	KASIR	adedasani6@gmail.com			KERJA		LAKI-LAKI		MESS 52		VIP		TANJUNG PINANG		ADESAEPUDIN		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
MARTIN LESMANA	E7722064	KASIR	martinlesmana7788@gmail.com	namtiplesman@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		PONTIANAK				SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
ARIEF FADLI WAHYU	X4788021	KASIR	arief.sadboy1122@gmail.com	arief.fans.sadbor@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		KISARAN		ARIEF FADLI WAHYU		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
COCO FRAN SISCO	X6958677	KASIR	cocofransisco8899@gmail.com	cocofransisco8899@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		LUBUK PAKAM		COCO		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
FENDI CANDRA	X2242324	KASIR	fendi.wakwau88@gmail.com	fendi.wakwau88@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN		candrafend@gmail.com		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
SULISTIANI	E7359416	KASIR	sulis.wakwau88@gmail.com			DIRUMAHKAN		PEREMPUAN				VIP		LUBUK PAKAM		SULISTIANI		SEASON 8		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
RIZKY PRADANA NAIBAHO	E2364836	KASIR	rizkynamthip@gmail.com	rizkynamthip@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		BINJAI		PRADANA		SEASON 4		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
OKTOBERIUS HASRAT SETIAWAN GEA	X2811533	KASIR	geaoktaberius@gmail.com	geaoktaberius@gmail.com		KERJA		LAKI-LAKI		MESS 52		VIP		MEDAN		oktoberius gea "R'G2"		SEASON 5		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN
GUNTUR ANUGRAH SEJATI	E9670921	KASIR	gntrsejati@gmail.com	gntrsejati@gmail.com		DIRUMAHKAN		LAKI-LAKI		LIMDA		VIP		MEDAN		GUNTUR		SEASON 7		14/06/2026	NOT TODAY	0 TAHUN 0 BULAN		14/06/2026	0 TAHUN 0 BULAN`;

// Split into lines
const lines = rawData.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

function parseDate(dStr) {
  if (!dStr) return '';
  dStr = dStr.trim();
  if (dStr === '-' || dStr === 'NOT TODAY') return '';
  const parts = dStr.split('/');
  if (parts.length === 3) {
    let day = parts[0].padStart(2, '0');
    let month = parts[1].padStart(2, '0');
    let year = parts[2];
    if (year.length === 4) {
      return year + '-' + month + '-' + day;
    }
  }
  return dStr;
}

const staffs = [];
let idCounter = 1;

for (const line of lines) {
  const cells = line.split(/\t/).map(c => c.trim().replace(/^"|"$/g, ''));
  if (cells.length < 3 || !cells[0]) continue;
  
  // Skip header lines
  if (cells[0].includes('NAMA ALL STAFF') || cells[0].includes('STATUS')) {
    continue;
  }
  
  const namaAllStaff = cells[0];
  const nomorPasport = cells[1] || '';
  const jabatanPosisi = cells[2] || '';
  const emailDrive = cells[3] || '';
  const emailBk = cells[4] || '';
  
  // Filter out empty spaces to find categorical fields
  const filledCells = cells.filter(Boolean);
  
  // Dynamic parsing based on content!
  let status = 'KERJA';
  for (const c of filledCells) {
    const uc = c.toUpperCase();
    if (uc === 'KERJA' || uc === 'DIRUMAHKAN' || uc === 'CUTI') {
      status = c;
      break;
    }
  }
  
  let jenisKelamin = 'Laki-laki';
  for (const c of filledCells) {
    const uc = c.toUpperCase();
    if (uc === 'LAKI-LAKI' || uc === 'PEREMPUAN') {
      jenisKelamin = uc === 'PEREMPUAN' ? 'Perempuan' : 'Laki-laki';
      break;
    }
  }
  
  let messTinggal = '';
  for (const c of filledCells) {
    const uc = c.toUpperCase();
    if (uc === 'MESS 52' || uc === 'MESS 85' || uc === 'V I P' || uc === 'LIMDA') {
      messTinggal = c;
      break;
    }
  }
  
  let nomorKamar = '';
  for (const c of filledCells) {
    const uc = c.toUpperCase();
    if (uc === 'VIP' || uc.includes('ROOM 7') || uc.includes('ROOM')) {
      nomorKamar = c;
      break;
    }
  }
  
  // Let's grab the date cells (DD/MM/YYYY)
  const dateCells = filledCells.filter(c => c.includes('/') && c.split('/').length === 3);
  let tanggalLahir = '2026-06-14';
  let tanggalMulaiKerja = '2026-06-14';
  
  if (dateCells.length > 0) {
    tanggalLahir = parseDate(dateCells[0]);
    if (dateCells.length > 1) {
      tanggalMulaiKerja = parseDate(dateCells[1]);
    } else {
      tanggalMulaiKerja = tanggalLahir; // If only 1 date, use it
    }
  }
  
  // Also look for values or text that matches typical cities
  let asalKota = '';
  const knownCities = ['MEDAN', 'PONTIANAK', 'BINJAI', 'JAKARTA', 'SURABAYA', 'LUBUK PAKAM', 'TEBAS', 'SIDIKALANG', 'SINGKAWANG', 'PANGKAL PINANG', 'BATAM', 'Padang', 'RIAU', 'ACEH', 'BERINGIN', 'SIANTAR', 'BERASTAGI', 'LANGSA', 'TELUK DALAM', 'STABAT', 'BOGOR', 'PERBAUNGAN', 'KISARAN', 'NTB', 'BASRA', 'TANJUNGPINANG', 'TANJUNG PINANG', 'Tanjung morawa', 'KLAMBIR 5 MEDAN', 'TanjungPinang'];
  for (const c of filledCells) {
    if (knownCities.some(city => c.toUpperCase().includes(city.toUpperCase()))) {
      asalKota = c;
      break;
    }
  }
  
  // Season
  let seasonRumahIbadah = '';
  for (const c of filledCells) {
    if (c.toUpperCase().includes('SEASON')) {
      seasonRumahIbadah = c;
      break;
    }
  }
  
  // Line ID: It usually comes after the city or before season, let's filter typical cells
  let idLine = '';
  const specialLineExclusions = [namaAllStaff, nomorPasport, jabatanPosisi, emailDrive, emailBk, status, jenisKelamin, messTinggal, nomorKamar, asalKota, seasonRumahIbadah, 'NOT TODAY', '0 TAHUN 0 BULAN', '30 TAHUN 3 BULAN', '24 TAHUN 4 BULAN'];
  const potentialLines = filledCells.filter(c => {
    return !specialLineExclusions.includes(c) && !c.includes('/') && !c.includes('@') && !/^\d+/.test(c);
  });
  if (potentialLines.length > 0) {
    idLine = potentialLines[0];
  }

  staffs.push({
    id: 'st-' + (idCounter++),
    namaAllStaff,
    nomorPasport,
    jabatanPosisi,
    emailDrive,
    emailBk,
    status,
    jenisKelamin,
    messTinggal,
    nomorKamar,
    asalKota,
    idLine,
    seasonRumahIbadah,
    tanggalLahir,
    tanggalMulaiKerja,
    expVisa: '',
    typeVisa: '',
    lokasiSaatIni: asalKota,
    notes: ''
  });
}

const outputContent = 'import { Staff, OvertimeRecord } from "./types";\n\n' +
  'export const SAMPLE_STAFF: Staff[] = ' + JSON.stringify(staffs, null, 2) + ';\n\n' +
  'export const SAMPLE_MISTAKES: any[] = [];\n' +
  'export const SAMPLE_OVERTIMES: OvertimeRecord[] = [];\n';

fs.writeFileSync('src/sampleData.ts', outputContent, 'utf-8');
console.log('Reparsed successfully! Total profiles parsed:', staffs.length);
